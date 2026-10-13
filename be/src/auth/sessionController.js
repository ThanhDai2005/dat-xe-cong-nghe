const db = require("../database");
const {
  rotateRefreshToken,
  verifyAccessToken,
  blockJti,
  revokeSingleSession,
  revokeAllSessions,
} = require("./tokenService");

// ══════════════════════════════════════════════════════════════════════════
//  POST /api/v1/auth/refresh-token
//  Body: { userId, familyId, refreshToken }
// ══════════════════════════════════════════════════════════════════════════
const refreshToken = async (req, res) => {
  const { userId, familyId, refreshToken: incomingToken } = req.body;

  if (!userId || !familyId || !incomingToken) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin: userId, familyId, refreshToken",
    });
  }

  try {
    // ── Lấy thông tin user mới nhất từ DB ──────────────────────────────
    const [rows] = await db.query(
      "SELECT id, full_name, email, role, status FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Người dùng không tồn tại" });
    }

    const user = rows[0];

    if (user.status !== "active") {
      // Tài khoản bị khóa → thu hồi toàn bộ phiên
      await revokeAllSessions(userId);
      return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa" });
    }

    // ── RTR: Xoay vòng token (tự phát hiện replay attack bên trong) ────
    const { accessToken, refreshToken: newRefreshToken, familyId: newFamilyId } =
      await rotateRefreshToken({
        userId,
        familyId,
        incomingToken,
        userPayload: { userId: user.id, role: user.role, status: user.status },
      });

    return res.status(200).json({
      success: true,
      message: "Làm mới token thành công",
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          familyId:     newFamilyId,
          expiresIn:    15 * 60, // 15 phút
        },
      },
    });
  } catch (error) {
    // Replay attack hoặc token hết hạn
    if (error.code === "REPLAY_ATTACK") {
      return res.status(401).json({
        success: false,
        message: "Phiên không hợp lệ. Vui lòng đăng nhập lại",
        code: "REPLAY_ATTACK",
      });
    }

    console.error("❌ Lỗi refresh-token:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// ══════════════════════════════════════════════════════════════════════════
//  POST /api/v1/auth/logout
//  Headers: Authorization: Bearer <accessToken>
//  Body: { familyId, refreshToken, allDevices?: boolean }
// ══════════════════════════════════════════════════════════════════════════
const logout = async (req, res) => {
  const authHeader = req.headers["authorization"] || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!accessToken) {
    return res.status(401).json({ success: false, message: "Không có Access Token" });
  }

  const { familyId, refreshToken: currentRefreshToken, allDevices = false } = req.body;

  try {
    // ── Xác thực Access Token → lấy jti và sub (userId) ────────────────
    let decoded;
    try {
      decoded = await verifyAccessToken(accessToken);
    } catch (err) {
      // Token đã hết hạn hoặc không hợp lệ vẫn cho phép logout
      // nhưng không thể block jti
      if (familyId && currentRefreshToken) {
        if (allDevices) {
          await revokeAllSessions(req.body.userId);
        } else {
          await revokeSingleSession(req.body.userId, familyId);
        }
      }
      return res.status(200).json({ success: true, message: "Đăng xuất thành công" });
    }

    const userId = decoded.sub;

    // ── Vô hiệu hóa Access Token hiện tại (ghi jti vào blocklist) ──────
    await blockJti(decoded.jti, decoded.exp);

    // ── Xóa Refresh Token trên Redis ────────────────────────────────────
    if (allDevices) {
      await revokeAllSessions(userId);
    } else if (familyId) {
      await revokeSingleSession(userId, familyId);
    }

    return res.status(200).json({
      success: true,
      message: allDevices
        ? "Đã đăng xuất khỏi tất cả thiết bị"
        : "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi logout:", error.message);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

module.exports = { refreshToken, logout };
