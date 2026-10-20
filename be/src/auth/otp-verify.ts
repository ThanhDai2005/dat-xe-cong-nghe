import crypto from "node:crypto";
import type { RequestHandler } from "express";
import { z } from "zod";
import { config } from "../config";
import { db } from "../database";
import { redis } from "../redis";
import { hashOtp, otpKey, type OtpRecord } from "./otp-utils";
import { issueSession } from "./sessions";
import { publicUser, type UserRow } from "./types";
import { normalizeVnPhone } from "./validation";

const verifySchema = z.object({
  otpSessionId: z.string().uuid(),
  phone: z.string(),
  otpCode: z.string().regex(/^\d{6}$/),
  clientRole: z.enum(["CUSTOMER", "DRIVER"]).optional(),
});

const CONSUME_OTP_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local record = cjson.decode(raw)
if ARGV[3] ~= '' and record.clientRole ~= ARGV[3] then return -2 end
if record.phone ~= ARGV[1] or record.codeHash ~= ARGV[2] then
  record.attempts = record.attempts + 1
  if record.attempts >= 5 then redis.call('DEL', KEYS[1])
  else redis.call('SET', KEYS[1], cjson.encode(record), 'KEEPTTL') end
  return -1
end
redis.call('DEL', KEYS[1])
return raw
`;

export const verifyOtpHandler: RequestHandler = async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  const phone = parsed.success ? normalizeVnPhone(parsed.data.phone) : null;
  if (!parsed.success || !phone) { res.status(400).json({ success: false, message: "Thông tin OTP không hợp lệ" }); return; }
  const { otpSessionId, otpCode, clientRole } = parsed.data;
  const raw = await redis.eval(CONSUME_OTP_SCRIPT, 1, otpKey(otpSessionId), phone, hashOtp(otpSessionId, otpCode, config.JWT_ACCESS_SECRET), clientRole ?? "");
  if (raw === -2) { res.status(403).json({ success: false, message: "Vai trò không khớp với phiên OTP" }); return; }
  if (typeof raw !== "string") { res.status(401).json({ success: false, message: "Mã OTP không đúng hoặc đã hết hạn" }); return; }
  const record = JSON.parse(raw) as OtpRecord;

  const connection = await db.getConnection();
  let user: UserRow;
  let isNewUser = false;
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<UserRow[]>(
      "SELECT id, full_name, email, phone, password_hash, role, status FROM users WHERE phone = ? LIMIT 1 FOR UPDATE",
      [phone],
    );
    user = rows[0];
    if (user && user.role !== record.clientRole) {
      await connection.rollback();
      res.status(403).json({ success: false, message: "Số điện thoại thuộc tài khoản có vai trò khác" }); return;
    }
    if (user?.status === "SUSPENDED") {
      await connection.rollback();
      res.status(403).json({ success: false, message: "Tài khoản đã bị khóa" }); return;
    }
    if (!user) {
      const userId = crypto.randomUUID();
      const status = record.clientRole === "CUSTOMER" ? "ACTIVE" : "PENDING";
      await connection.execute(
        "INSERT INTO users (id, full_name, phone, role, status, phone_verified_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(3))",
        [userId, record.clientRole === "CUSTOMER" ? "Khách hàng GoRide" : "Tài xế GoRide", phone, record.clientRole, status],
      );
      user = { id: userId, full_name: record.clientRole === "CUSTOMER" ? "Khách hàng GoRide" : "Tài xế GoRide", email: null, phone, password_hash: null, role: record.clientRole, status } as UserRow;
      isNewUser = true;
    } else {
      await connection.execute(
        "UPDATE users SET phone_verified_at = UTC_TIMESTAMP(3), status = IF(role = 'CUSTOMER' AND status = 'PENDING', 'ACTIVE', status) WHERE id = ?",
        [user.id],
      );
      if (user.role === "CUSTOMER" && user.status === "PENDING") user.status = "ACTIVE";
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }

  res.json({
    success: true,
    message: user.status === "ACTIVE" ? "Xác thực thành công" : "Đã xác thực số điện thoại, tài khoản đang chờ duyệt",
    data: { isNewUser, user: publicUser(user), tokens: user.status === "ACTIVE" ? await issueSession(user) : null },
  });
};
