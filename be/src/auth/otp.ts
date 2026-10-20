import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { redis } from "../redis";
import { createOtp, hashOtp, maskPhone, otpKey, type OtpPurpose, type OtpRecord } from "./otp-utils";
import { sendSms } from "./sms";
import { normalizeVnPhone } from "./validation";
import { verifyOtpHandler } from "./otp-verify";

export const otpRouter = Router();
const OTP_TTL_SECONDS = 5 * 60;

const sendSchema = z.object({
  phone: z.string(),
  purpose: z.string().transform((value) => value.toUpperCase()).pipe(z.enum(["LOGIN", "REGISTER"])),
  clientRole: z.enum(["CUSTOMER", "DRIVER"]),
});

otpRouter.post("/phone/otp/send", async (req, res) => {
  const parsed = sendSchema.safeParse(req.body);
  const phone = parsed.success ? normalizeVnPhone(parsed.data.phone) : null;
  if (!parsed.success || !phone) { res.status(400).json({ success: false, message: "Thông tin OTP không hợp lệ" }); return; }
  const { purpose, clientRole } = parsed.data;
  const cooldownKey = `auth:otp:cooldown:${phone}`;
  if (await redis.set(cooldownKey, "1", "EX", 60, "NX") !== "OK") {
    res.status(429).json({ success: false, message: "Vui lòng đợi 60 giây trước khi gửi lại mã" }); return;
  }
  const sessionId = crypto.randomUUID();
  const code = createOtp();
  const record: OtpRecord = { phone, purpose: purpose as OtpPurpose, clientRole, codeHash: hashOtp(sessionId, code, config.JWT_ACCESS_SECRET), attempts: 0 };
  await redis.set(otpKey(sessionId), JSON.stringify(record), "EX", OTP_TTL_SECONDS);
  try {
    await sendSms(phone, `Mã xác thực GoRide của bạn là ${code}. Mã có hiệu lực 5 phút.`);
  } catch (error) {
    await redis.del(otpKey(sessionId), cooldownKey);
    console.error("SMS delivery failed", error);
    res.status(503).json({ success: false, message: "Chưa thể gửi SMS. Vui lòng thử lại" }); return;
  }
  res.json({ success: true, message: "Đã gửi OTP", data: { otpSessionId: sessionId, phoneMasked: maskPhone(phone), expiresInSeconds: OTP_TTL_SECONDS } });
});

otpRouter.post("/phone/otp/verify", verifyOtpHandler);
