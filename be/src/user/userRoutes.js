const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

// Middleware xác thực token
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng cung cấp Access Token để truy cập",
    });
  }

  const token = authHeader.slice(7).trim();
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Token không hợp lệ" });
    }
    req.user = {
      id: decoded.userId || decoded.sub || decoded.id,
      role: decoded.role,
      status: decoded.status,
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Xác thực token thất bại" });
  }
};

router.use(requireAuth);

// ── 1. GET /profile ────────────────────────────────────────────────────────
// Lấy thông tin chi tiết tài khoản đang đăng nhập
// Output: { success: true, message: "Thành công", data: { id, fullName, email, phone, role, status, avatarUrl } }
router.get("/profile", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT id, full_name AS fullName, email, phone, role, status, avatar_url AS avatarUrl, created_at AS createdAt
         FROM users
        WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    res.json({
      success: true,
      message: "Thành công",
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// ── 2. PATCH /profile ──────────────────────────────────────────────────────
// Cập nhật thông tin cá nhân (Edit Profile)
// Body: { fullName?, email?, avatarUrl? }
// Output: { success: true, message: "Cập nhật thành công", data: { user } }
router.patch("/profile", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, email, avatarUrl } = req.body;

    const updates = [];
    const params = [];

    if (fullName !== undefined) {
      updates.push("full_name = ?");
      params.push(String(fullName).trim());
    }
    if (email !== undefined) {
      updates.push("email = ?");
      params.push(String(email).trim().toLowerCase());
    }
    if (avatarUrl !== undefined) {
      updates.push("avatar_url = ?");
      params.push(String(avatarUrl).trim());
    }

    if (updates.length > 0) {
      params.push(userId);
      await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
    }

    const [updated] = await db.query(
      `SELECT id, full_name AS fullName, email, phone, role, status, avatar_url AS avatarUrl
         FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    res.json({
      success: true,
      message: "Cập nhật thành công",
      data: { user: updated[0] },
    });
  } catch (err) {
    next(err);
  }
});

// ── 3. PATCH /password/change ──────────────────────────────────────────────
// Đổi mật khẩu tài khoản đang đăng nhập
// Body: { oldPassword, newPassword, confirmNewPassword }
// Output: { success: true, message: "Đổi mật khẩu thành công", data: null }
router.patch("/password/change", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu xác nhận không khớp",
      });
    }

    const [rows] = await db.query("SELECT password_hash FROM users WHERE id = ? LIMIT 1", [userId]);
    if (!rows[0]) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
    }

    const match = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!match) {
      return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không chính xác" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, userId]);

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
      data: null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
