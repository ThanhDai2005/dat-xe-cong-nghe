import crypto from "node:crypto";

export type OtpPurpose = "LOGIN" | "REGISTER";
export type OtpRole = "CUSTOMER" | "DRIVER";
export interface OtpRecord {
  phone: string;
  purpose: OtpPurpose;
  clientRole: OtpRole;
  codeHash: string;
  attempts: number;
}

export const createOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
export const hashOtp = (sessionId: string, code: string, secret: string) =>
  crypto.createHmac("sha256", secret).update(`${sessionId}:${code}`).digest("hex");
export const maskPhone = (phone: string) => `${phone.slice(0, 6)}•••${phone.slice(-3)}`;
export const otpKey = (sessionId: string) => `auth:otp:${sessionId}`;
