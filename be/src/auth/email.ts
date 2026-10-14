import nodemailer from "nodemailer";
import { config } from "../config";

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  if (!config.SMTP_HOST) throw new Error("SMTP_HOST chưa được cấu hình");
  const transport = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } : undefined,
  });
  const url = new URL("/api/v1/auth/email/verify", config.APP_BASE_URL);
  url.searchParams.set("token", token);
  await transport.sendMail({
    from: config.SMTP_FROM,
    to,
    subject: "Xác thực tài khoản GoRide",
    text: `Mở liên kết sau trong 24 giờ để xác thực email: ${url.toString()}`,
  });
}
