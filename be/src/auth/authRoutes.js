const express = require("express");
const router  = express.Router();
const { login }                    = require("./authController");
const { refreshToken, logout }     = require("./sessionController");
const { loginV1 }                  = require("./loginController");

// ── TASK-BE-01: Đăng nhập ─────────────────────────────────────────────────
router.post("/login", login);

// ── TASK-BE-03: Đăng nhập nâng cao (Argon2id + Brute Force) ─────────────────
router.post("/v1/login", loginV1);

// ── TASK-BE-07: Quản lý phiên ─────────────────────────────────────────────
router.post("/refresh-token", refreshToken);
router.post("/logout",        logout);

module.exports = router;
