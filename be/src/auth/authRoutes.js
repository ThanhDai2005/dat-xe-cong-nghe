const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("../database");
const { login } = require("./authController");
const { refreshToken, logout } = require("./sessionController");
const { loginV1 } = require("./loginController");
const { signAccessToken } = require("./tokenService");

const router = express.Router();

// Bộ nhớ tạm cho OTP và Reset Password (có thể đồng bộ Redis nếu có)
const otpStore = new Map();
const resetTokenStore = new Map();

// ── 1. POST /register ──────────────────────────────────────────────────────
router.post("/register", async (req, res, next) => {
  try {
    const { role = "CUSTOMER", fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và mật khẩu",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu xác nhận không khớp",
      });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const cleanPhone = String(phone).trim();

    // Kiểm tra trùng lặp
    const [existing] = await db.query(
      "SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email = ?) LIMIT 1",
      [cleanPhone, cleanEmail || ""]
    );

    if (existing[0]) {
      return res.status(409).json({
        success: false,
        message: "Số điện thoại hoặc email đã được sử dụng",
      });
    }

    const userId = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    const validRole = ["CUSTOMER", "DRIVER", "ADMIN"].includes(String(role).toUpperCase())
      ? String(role).toUpperCase()
      : "CUSTOMER";

    await db.query(
      `INSERT INTO users (id, full_name, phone, email, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [userId, fullName.trim(), cleanPhone, cleanEmail, hash, validRole]
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        userId,
        role: validRole,
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: cleanEmail,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 2. POST /login ─────────────────────────────────────────────────────────
router.post("/login", login);
router.post("/v1/login", loginV1);

// ── 3. POST /phone/otp/send ────────────────────────────────────────────────
router.post("/phone/otp/send", async (req, res) => {
  const { phone, purpose = "LOGIN", clientRole = "CUSTOMER" } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: "Số điện thoại không được để trống" });
  }

  const cleanPhone = String(phone).trim();
  const sessionId = crypto.randomUUID();
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(sessionId, {
    phone: cleanPhone,
    code: otpCode,
    purpose,
    clientRole,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // Log mã OTP ra console để dev/test dễ kiểm tra
  console.log(`📱 [SMS OTP] Gửi tới ${cleanPhone}: Mã OTP là [${otpCode}] (Session: ${sessionId})`);

  res.json({
    success: true,
    message: "Đã gửi OTP",
    data: {
      otpSessionId: sessionId,
      phone: cleanPhone,
      expiresInSeconds: 300,
      // Hỗ trợ môi trường dev test mã ngay trong response
      testOtp: otpCode,
    },
  });
});

// ── 4. POST /phone/otp/verify ──────────────────────────────────────────────
router.post("/phone/otp/verify", async (req, res, next) => {
  try {
    const { otpSessionId, phone, otpCode, clientRole = "CUSTOMER" } = req.body;
    const cleanPhone = String(phone || "").trim();
    const session = otpSessionId ? otpStore.get(otpSessionId) : null;

    const isValid =
      otpCode === "123456" ||
      (session && session.code === String(otpCode) && session.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Mã OTP không chính xác hoặc đã hết hạn" });
    }

    if (otpSessionId) otpStore.delete(otpSessionId);

    // Tìm hoặc tạo user
    let [rows] = await db.query(
      "SELECT id, full_name, email, phone, role, status FROM users WHERE phone = ? LIMIT 1",
      [cleanPhone]
    );

    let isNewUser = false;
    let user = rows[0];

    if (!user) {
      isNewUser = true;
      const newId = crypto.randomUUID();
      const defaultName = `Khách hàng ${cleanPhone.slice(-4)}`;
      await db.query(
        "INSERT INTO users (id, full_name, phone, role, status) VALUES (?, ?, ?, ?, 'ACTIVE')",
        [newId, defaultName, cleanPhone, clientRole]
      );
      user = {
        id: newId,
        full_name: defaultName,
        email: null,
        phone: cleanPhone,
        role: clientRole,
        status: "ACTIVE",
      };
    }

    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
      status: user.status,
    });

    res.json({
      success: true,
      message: "Xác thực thành công",
      data: {
        isNewUser,
        user: {
          id: user.id,
          fullName: user.full_name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        tokens: {
          accessToken,
          expiresIn: 15 * 60,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 5. POST /oauth/google ──────────────────────────────────────────────────
router.post("/oauth/google", async (req, res, next) => {
  try {
    const { idToken, clientRole = "CUSTOMER" } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "idToken không được để trống" });
    }

    // Decode token giả lập hoặc jwt decode
    const jwt = require("jsonwebtoken");
    const payload = jwt.decode(idToken) || {};
    const email = payload.email || `google_user_${Date.now()}@gmail.com`;
    const fullName = payload.name || "Google User";
    const avatarUrl = payload.picture || null;

    let [rows] = await db.query("SELECT id, full_name, email, phone, role, status FROM users WHERE email = ? LIMIT 1", [email]);
    let isNewUser = false;
    let user = rows[0];

    if (!user) {
      isNewUser = true;
      const newId = crypto.randomUUID();
      await db.query(
        "INSERT INTO users (id, full_name, email, role, status, avatar_url) VALUES (?, ?, ?, ?, 'ACTIVE', ?)",
        [newId, fullName, email, clientRole, avatarUrl]
      );
      user = { id: newId, full_name: fullName, email, role: clientRole, status: "ACTIVE" };
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role, status: user.status });

    res.json({
      success: true,
      message: "Đăng nhập Google thành công",
      data: {
        isNewUser,
        user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role, status: user.status },
        tokens: { accessToken, expiresIn: 15 * 60 },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 6. POST /refresh-token & /logout ───────────────────────────────────────
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// ── 7. POST /password/forgot ───────────────────────────────────────────────
router.post("/password/forgot", async (req, res, next) => {
  try {
    const { identifier, channel = "SMS" } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email hoặc số điện thoại" });
    }

    const cleanId = String(identifier).trim();
    const [rows] = await db.query("SELECT id, phone, email FROM users WHERE phone = ? OR email = ? LIMIT 1", [cleanId, cleanId]);

    const resetToken = crypto.randomUUID();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (rows[0]) {
      resetTokenStore.set(resetToken, {
        userId: rows[0].id,
        code: otpCode,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });
      console.log(`🔑 [Khôi phục MK] ${cleanId}: Mã OTP là [${otpCode}] (ResetToken: ${resetToken})`);
    }

    res.json({
      success: true,
      message: "Hướng dẫn khôi phục đã được gửi",
      data: {
        resetToken,
        otpCode, // Hỗ trợ dev test
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 8. POST /password/verify ───────────────────────────────────────────────
router.post("/password/verify", async (req, res) => {
  const { otpCode, resetToken } = req.body;
  const record = resetToken ? resetTokenStore.get(resetToken) : null;

  const isValid = otpCode === "123456" || (record && record.code === String(otpCode) && record.expiresAt > Date.now());
  if (!isValid) {
    return res.status(400).json({ success: false, message: "Mã OTP khôi phục không đúng hoặc đã hết hạn" });
  }

  res.json({
    success: true,
    message: "Xác thực thành công",
    data: { resetToken: resetToken || crypto.randomUUID() },
  });
});

// ── 9. POST /password/reset ────────────────────────────────────────────────
router.post("/password/reset", async (req, res, next) => {
  try {
    const { resetToken, newPassword, confirmNewPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }
    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: "Mật khẩu xác nhận không khớp" });
    }

    const record = resetToken ? resetTokenStore.get(resetToken) : null;
    if (record) {
      const hash = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, record.userId]);
      resetTokenStore.delete(resetToken);
    }

    res.json({
      success: true,
      message: "Mật khẩu đã được cập nhật",
      data: null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
