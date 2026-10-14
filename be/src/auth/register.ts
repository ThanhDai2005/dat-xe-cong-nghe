import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import { db } from "../database";
import { redis } from "../redis";
import { sendVerificationEmail } from "./email";
import { registerSchema } from "./validation";

export const registerRouter = Router();
const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

async function createEmailToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  await db.execute(
    "INSERT INTO verification_tokens (id, user_id, token_hash, purpose, expires_at) VALUES (?, ?, ?, 'EMAIL_ACTIVATION', DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 24 HOUR))",
    [crypto.randomUUID(), userId, sha256(token)],
  );
  return token;
}

registerRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Dữ liệu đăng ký không hợp lệ", errors: z.flattenError(parsed.error).fieldErrors }); return;
  }
  const { role, fullName, phone, password } = parsed.data;
  const email = parsed.data.email?.trim().toLowerCase() || null;
  const userId = crypto.randomUUID();
  try {
    await db.execute(
      "INSERT INTO users (id, full_name, phone, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')",
      [userId, fullName, phone, email, await bcrypt.hash(password, 12), role],
    );
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      res.status(409).json({ success: false, message: "Email hoặc số điện thoại đã được sử dụng" }); return;
    }
    throw error;
  }
  let emailVerificationSent = false;
  if (email) {
    const token = await createEmailToken(userId);
    try { await sendVerificationEmail(email, token); emailVerificationSent = true; }
    catch (error) { console.error("Verification email failed", error); }
  }
  res.status(201).json({
    success: true,
    message: email ? "Đã tạo tài khoản. Vui lòng xác thực email hoặc số điện thoại" : "Đã tạo tài khoản. Vui lòng xác thực số điện thoại",
    data: { userId, role, status: "PENDING", emailVerificationSent },
  });
});

registerRouter.get("/email/verify", async (req, res) => {
  const token = z.string().min(20).safeParse(req.query.token);
  if (!token.success) { res.status(400).json({ success: false, message: "Liên kết không hợp lệ" }); return; }
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<(RowDataPacket & { id: string; user_id: string })[]>(
      "SELECT vt.id, vt.user_id FROM verification_tokens vt WHERE vt.token_hash = ? AND vt.purpose = 'EMAIL_ACTIVATION' AND vt.used_at IS NULL AND vt.expires_at > UTC_TIMESTAMP(3) FOR UPDATE",
      [sha256(token.data)],
    );
    const record = rows[0];
    if (!record) { await connection.rollback(); res.status(400).json({ success: false, message: "Liên kết đã hết hạn hoặc đã sử dụng" }); return; }
    await connection.execute("UPDATE verification_tokens SET used_at = UTC_TIMESTAMP(3) WHERE id = ?", [record.id]);
    await connection.execute(
      "UPDATE users SET email_verified_at = UTC_TIMESTAMP(3), status = IF(role = 'CUSTOMER' AND status = 'PENDING', 'ACTIVE', status) WHERE id = ?",
      [record.user_id],
    );
    await connection.commit();
    res.json({ success: true, message: "Email đã được xác thực", data: { userId: record.user_id } });
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
});

registerRouter.post("/email/resend", async (req, res) => {
  const parsed = z.object({ email: z.email() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, message: "Email không hợp lệ" }); return; }
  const email = parsed.data.email.toLowerCase();
  const key = `auth:email-resend:${sha256(email)}`;
  if (await redis.set(key, "1", "EX", 60, "NX") !== "OK") {
    res.status(429).json({ success: false, message: "Vui lòng đợi trước khi gửi lại" }); return;
  }
  const [users] = await db.execute<(RowDataPacket & { id: string })[]>(
    "SELECT id FROM users WHERE email = ? AND email_verified_at IS NULL LIMIT 1", [email],
  );
  if (users[0]) {
    const token = await createEmailToken(users[0].id);
    await sendVerificationEmail(email, token);
  }
  res.json({ success: true, message: "Nếu email tồn tại, liên kết xác thực đã được gửi" });
});
