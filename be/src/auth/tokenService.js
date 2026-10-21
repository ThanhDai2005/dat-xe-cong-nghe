const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
require("../config/env");
const redis = require("../config/redis");

// ─── Đọc khóa RS256 từ be/src/.env ────────────────────────────────────────
const PRIVATE_KEY = (process.env.JWT_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const PUBLIC_KEY = (process.env.JWT_PUBLIC_KEY || "").replace(/\\n/g, "\n");

// ─── TTL ──────────────────────────────────────────────────────────────────
const ACCESS_TOKEN_TTL_SEC = 15 * 60;          // 15 phút
const REFRESH_TOKEN_TTL_SEC = 14 * 24 * 60 * 60; // 14 ngày

// ─── Redis key builders ───────────────────────────────────────────────────
const K = {
  refresh:     (userId, familyId) => `auth:refresh:${userId}:${familyId}`,
  userFamilies:(userId)           => `auth:families:${userId}`,
  blocklist:   (jti)              => `auth:blocklist:${jti}`,
};

// ══════════════════════════════════════════════════════════════════════════
//  ACCESS TOKEN
// ══════════════════════════════════════════════════════════════════════════

/**
 * Ký Access Token RS256
 * @param {{ userId, role, status }} payload
 * @returns {string} JWT access token
 */
const signAccessToken = (payload) => {
  if (!PRIVATE_KEY) throw new Error("JWT_PRIVATE_KEY chưa được cấu hình trong be/src/.env");

  const jti = uuidv4();
  return jwt.sign(
    {
      sub:    String(payload.userId),
      role:   payload.role,
      status: payload.status,
      jti,
    },
    PRIVATE_KEY,
    { algorithm: "RS256", expiresIn: ACCESS_TOKEN_TTL_SEC }
  );
};

/**
 * Xác thực Access Token — tự động kiểm tra blocklist jti
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyAccessToken = async (token) => {
  if (!PUBLIC_KEY) throw new Error("JWT_PUBLIC_KEY chưa được cấu hình trong be/src/.env");

  const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });

  const isBlocked = await redis.exists(K.blocklist(decoded.jti));
  if (isBlocked) throw new Error("TOKEN_REVOKED: Access token đã bị thu hồi");

  return decoded;
};

// ══════════════════════════════════════════════════════════════════════════
//  REFRESH TOKEN — phát hành lần đầu (login)
// ══════════════════════════════════════════════════════════════════════════

/**
 * Tạo Refresh Token mới khi user đăng nhập.
 * Mỗi lần login → 1 family riêng biệt.
 * @param {string|number} userId
 * @returns {{ refreshToken: string, familyId: string }}
 */
const issueRefreshToken = async (userId) => {
  const familyId     = uuidv4();
  const refreshToken = crypto.randomBytes(64).toString("hex");

  const pipeline = redis.pipeline();
  // Lưu token: auth:refresh:{userId}:{familyId} = <token>
  pipeline.set(K.refresh(userId, familyId), refreshToken, "EX", REFRESH_TOKEN_TTL_SEC);
  // Theo dõi tất cả family của user để có thể revoke all
  pipeline.sadd(K.userFamilies(userId), familyId);
  pipeline.expire(K.userFamilies(userId), REFRESH_TOKEN_TTL_SEC);
  await pipeline.exec();

  return { refreshToken, familyId };
};

// ══════════════════════════════════════════════════════════════════════════
//  REFRESH TOKEN ROTATION (RTR) — gọi khi client xin cấp lại access token
// ══════════════════════════════════════════════════════════════════════════

/**
 * Xoay vòng Refresh Token theo chuẩn RTR.
 *
 * Luồng:
 *  1. Kiểm tra token cũ có trong Redis không
 *     → Không có  = đã bị dùng rồi (REPLAY ATTACK) → revoke ALL sessions
 *  2. Token không khớp → REPLAY ATTACK → revoke ALL sessions
 *  3. Hợp lệ → xóa token cũ, cấp (accessToken mới + refreshToken mới)
 *
 * @param {{ userId, familyId, incomingToken, userPayload }} params
 * @returns {{ accessToken: string, refreshToken: string, familyId: string }}
 */
const rotateRefreshToken = async ({ userId, familyId, incomingToken, userPayload }) => {
  const storedToken = await redis.get(K.refresh(userId, familyId));

  // ── Phát hiện Replay Attack ───────────────────────────────────────────
  if (!storedToken || storedToken !== incomingToken) {
    await revokeAllSessions(userId);
    throw Object.assign(
      new Error("REPLAY_ATTACK: Tái sử dụng refresh token. Toàn bộ phiên đã bị thu hồi."),
      { code: "REPLAY_ATTACK", statusCode: 401 }
    );
  }

  // ── Hợp lệ → rotate ──────────────────────────────────────────────────
  const newRefreshToken = crypto.randomBytes(64).toString("hex");
  const newAccessToken  = signAccessToken(userPayload);

  const pipeline = redis.pipeline();
  // Xóa token cũ ngay lập tức (single-use)
  pipeline.del(K.refresh(userId, familyId));
  // Ghi token mới vào cùng family
  pipeline.set(K.refresh(userId, familyId), newRefreshToken, "EX", REFRESH_TOKEN_TTL_SEC);
  await pipeline.exec();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, familyId };
};

// ══════════════════════════════════════════════════════════════════════════
//  REVOKE
// ══════════════════════════════════════════════════════════════════════════

/**
 * Thu hồi TOÀN BỘ phiên của user (logout all devices / bị tấn công).
 * @param {string|number} userId
 */
const revokeAllSessions = async (userId) => {
  const families = await redis.smembers(K.userFamilies(userId));
  if (!families.length) return;

  const pipeline = redis.pipeline();
  families.forEach((fid) => pipeline.del(K.refresh(userId, fid)));
  pipeline.del(K.userFamilies(userId));
  await pipeline.exec();
};

/**
 * Thu hồi một phiên cụ thể (logout 1 thiết bị).
 * @param {string|number} userId
 * @param {string} familyId
 */
const revokeSingleSession = async (userId, familyId) => {
  const pipeline = redis.pipeline();
  pipeline.del(K.refresh(userId, familyId));
  pipeline.srem(K.userFamilies(userId), familyId);
  await pipeline.exec();
};

/**
 * Thêm jti vào blocklist để vô hiệu hóa Access Token còn hạn sau khi logout.
 * TTL tự động = thời gian còn lại của token.
 * @param {string} jti
 * @param {number} exp  - Unix timestamp (lấy từ decoded.exp)
 */
const blockJti = async (jti, exp) => {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.set(K.blocklist(jti), "1", "EX", ttl);
  }
};

// ══════════════════════════════════════════════════════════════════════════
module.exports = {
  signAccessToken,
  verifyAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeAllSessions,
  revokeSingleSession,
  blockJti,
};
