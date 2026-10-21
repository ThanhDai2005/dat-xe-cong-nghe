const bcrypt = require("bcryptjs");
const db     = require("../database");
const redis  = require("../config/redis");
const { signAccessToken, issueRefreshToken } = require("./tokenService");

// ─── Hằng số ──────────────────────────────────────────────────────────────
const ACCESS_TOKEN_EXPIRES_IN = 15 * 60; // 900 giây
const MAX_ATTEMPTS            = 15;       // số lần sai tối đa
const LOCKOUT_TTL             = 15 * 60; // 15 phút khóa tạm thời (giây)

const BRUTE_KEY = (identifier) => `auth:brute:${identifier}`;

// ══════════════════════════════════════════════════════════════════════════
//  POST /api/v1/auth/login  (TASK-BE-03)
//  Body: { identifier: string, password: string, clientRole: string }
// ══════════════════════════════════════════════════════════════════════════
const loginV1 = async (req, res) => {
  const { identifier, password, clientRole } = req.body;

  // ── Validate đầu vào ─────────────────────────────────────────────────
  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ: identifier, password",
    });
  }

  try {
    // ── [1] Kiểm tra brute force ──────────────────────────────────────
    const attempts = parseInt(await redis.get(BRUTE_KEY(identifier))) || 0;

    if (attempts >= MAX_ATTEMPTS) {
      const ttl = await redis.ttl(BRUTE_KEY(identifier));
      return res.status(423).json({
        success:    false,
        message:    `Tài khoản bị khóa tạm thời do đăng nhập sai quá nhiều lần. Thử lại sau ${Math.ceil(ttl / 60)} phút`,
        code:       "ACCOUNT_TEMPORARILY_LOCKED",
        retryAfter: ttl,
      });
    }

    // ── [2] Tìm user theo email hoặc SĐT ─────────────────────────────
    const [rows] = await db.query(
      `SELECT id, full_name, email, phone, password_hash, role, status
       FROM users
       WHERE email = ? OR phone = ?
       LIMIT 1`,
      [identifier, identifier]
    );

    if (rows.length === 0) {
      // Tăng counter nhưng không lộ user có tồn tại hay không (chống user enumeration)
      await redis.pipeline()
        .incr(BRUTE_KEY(identifier))
        .expire(BRUTE_KEY(identifier), LOCKOUT_TTL)
        .exec();
      return res.status(401).json({
        success: false,
        message: "Thông tin đăng nhập không chính xác",
      });
    }

    const user = rows[0];

    // ── [3] Kiểm tra clientRole (AUTH_ROLE_MISMATCH) ──────────────────
    if (clientRole && String(user.role).toUpperCase() !== String(clientRole).toUpperCase()) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản không có quyền truy cập với vai trò '${clientRole}'`,
        code:    "AUTH_ROLE_MISMATCH",
      });
    }

    // ── [4] Kiểm tra trạng thái tài khoản ────────────────────────────
    const statusUpper = (user.status || "").toUpperCase();
    if (statusUpper !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          statusUpper === "SUSPENDED"
            ? "Tài khoản đã bị khóa vĩnh viễn. Vui lòng liên hệ hỗ trợ"
            : "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email",
        code: "ACCOUNT_INACTIVE",
      });
    }

    // ── [5] Xác thực mật khẩu (Argon2id) ─────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      const newAttempts = await redis.incr(BRUTE_KEY(identifier));
      await redis.expire(BRUTE_KEY(identifier), LOCKOUT_TTL);

      const remaining = MAX_ATTEMPTS - newAttempts;

      return res.status(401).json({
        success:           false,
        message:           remaining > 0
          ? `Mật khẩu không chính xác. Còn ${remaining} lần thử trước khi bị khóa`
          : `Tài khoản bị khóa tạm thời ${LOCKOUT_TTL / 60} phút`,
        code:              "INVALID_PASSWORD",
        attemptsRemaining: Math.max(0, remaining),
      });
    }

    // ── [6] Thành công → xóa counter brute force ─────────────────────
    await redis.del(BRUTE_KEY(identifier));

    // ── [7] Cấp phát Access Token + Refresh Token ─────────────────────
    const accessToken            = signAccessToken({
      userId: user.id,
      role:   user.role,
      status: user.status,
    });
    const { refreshToken, familyId } = await issueRefreshToken(user.id);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id:       user.id,
          fullName: user.full_name,
          email:    user.email,
          role:     user.role,
          status:   user.status,
        },
        tokens: {
          accessToken,
          refreshToken,
          familyId,
          expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        },
      },
    });
  } catch (error) {
    console.error("❌ Lỗi login v1:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    });
  }
};

module.exports = { loginV1 };
