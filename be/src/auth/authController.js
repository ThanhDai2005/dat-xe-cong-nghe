const db = require("../database");
const bcrypt = require("bcryptjs");
const { signAccessToken } = require("./tokenService");

const ACCESS_TOKEN_EXPIRES_IN = 15 * 60; // 15 phút (giây)

/**
 * POST /api/auth/login
 * Body: { identifier: string, password: string, clientRole: string }
 */
const login = async (req, res) => {
  const { identifier, password, clientRole } = req.body;

  // ── Validate đầu vào ────────────────────────────────────────────────────
  if (!identifier || !password || !clientRole) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ thông tin (identifier, password, clientRole)",
    });
  }

  try {
    // ── Tìm user theo email hoặc SĐT ──────────────────────────────────────
    const [rows] = await db.query(
      `SELECT id, full_name, email, phone, password_hash, role, status
       FROM users
       WHERE email = ? OR phone = ?
       LIMIT 1`,
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }

    const user = rows[0];

    // ── Kiểm tra role có khớp clientRole không ────────────────────────────
    if (clientRole && String(user.role).toUpperCase() !== String(clientRole).toUpperCase()) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản không có quyền truy cập với vai trò '${clientRole}'`,
      });
    }

    // ── Kiểm tra trạng thái tài khoản ─────────────────────────────────────
    const statusUpper = String(user.status || "").toUpperCase();
    if (statusUpper !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          statusUpper === "SUSPENDED" || statusUpper === "BANNED"
            ? "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ"
            : "Tài khoản chưa được kích hoạt",
      });
    }

    // ── Xác thực mật khẩu ─────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu không chính xác",
      });
    }

    // ── Ký Access Token ────────────────────────────────────────────────────
    const accessToken = signAccessToken({
      userId: user.id,
      role:   user.role,
      status: user.status,
    });

    // ── Trả về response ────────────────────────────────────────────────────
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
          expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        },
      },
    });
  } catch (error) {
    console.error("❌ Lỗi login:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    });
  }
};

module.exports = { login };
