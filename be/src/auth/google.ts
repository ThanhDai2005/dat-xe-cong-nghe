import crypto from "node:crypto";
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import { config } from "../config";
import { db } from "../database";
import { googleProfile } from "./google-profile";
import { issueSession } from "./sessions";
import { publicUser, type UserRow } from "./types";

export const googleRouter = Router();
const client = new OAuth2Client();
const bodySchema = z.object({ idToken: z.string().min(20), clientRole: z.literal("CUSTOMER") });

googleRouter.post("/oauth/google", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, message: "Dữ liệu Google Sign-In không hợp lệ" }); return; }
  if (!config.GOOGLE_CLIENT_ID) { res.status(503).json({ success: false, message: "Google Sign-In chưa được cấu hình" }); return; }

  let profile;
  try {
    const ticket = await client.verifyIdToken({ idToken: parsed.data.idToken, audience: config.GOOGLE_CLIENT_ID });
    profile = googleProfile(ticket.getPayload());
  } catch {
    res.status(401).json({ success: false, message: "Google ID Token không hợp lệ" }); return;
  }
  if (!profile) { res.status(401).json({ success: false, message: "Google ID Token thiếu email đã xác thực" }); return; }

  const [linked] = await db.execute<UserRow[]>(
    "SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role, u.status FROM user_identities i JOIN users u ON u.id = i.user_id WHERE i.provider = 'GOOGLE' AND i.provider_user_id = ? LIMIT 1",
    [profile.subject],
  );
  let user = linked[0];
  let isNewUser = false;
  if (!user) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [existingEmail] = await connection.execute<RowDataPacket[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [profile.email]);
      if (existingEmail.length) {
        await connection.rollback();
        res.status(409).json({ success: false, code: "ACCOUNT_LINK_REQUIRED", message: "Email đã có tài khoản. Hãy đăng nhập bằng phương thức hiện tại trước khi liên kết Google" }); return;
      }
      const userId = crypto.randomUUID();
      await connection.execute(
        "INSERT INTO users (id, full_name, email, avatar_url, role, status, email_verified_at) VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE', UTC_TIMESTAMP(3))",
        [userId, profile.fullName, profile.email, profile.avatarUrl],
      );
      await connection.execute(
        "INSERT INTO user_identities (id, user_id, provider, provider_user_id) VALUES (?, ?, 'GOOGLE', ?)",
        [crypto.randomUUID(), userId, profile.subject],
      );
      await connection.commit();
      const [created] = await db.execute<UserRow[]>(
        "SELECT id, full_name, email, phone, password_hash, role, status FROM users WHERE id = ?", [userId],
      );
      user = created[0];
      isNewUser = true;
    } catch (error) {
      await connection.rollback();
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
        res.status(409).json({ success: false, message: "Tài khoản vừa được tạo ở phiên khác. Vui lòng thử lại" }); return;
      }
      throw error;
    } finally { connection.release(); }
  }
  if (user.role !== "CUSTOMER" || user.status !== "ACTIVE") {
    res.status(403).json({ success: false, message: "Tài khoản không được phép đăng nhập" }); return;
  }
  res.json({ success: true, message: "Đăng nhập Google thành công", data: { isNewUser, user: publicUser(user), tokens: await issueSession(user) } });
});
