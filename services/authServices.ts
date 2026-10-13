import { http } from "@/lib/http";

export interface AuthUser {
  id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  role?: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface OtpVerifyResult extends AuthResult {
  isNewUser: boolean;
}

export type RecoveryChannel = "sms" | "email";

const AUTH = "/api/v1/auth";

export const authService = {
  // TASK-FE-01
  login: (username: string, password: string) =>
    http<AuthResult>(`${AUTH}/login`, { method: "POST", body: { username, password } }),

  googleLogin: (idToken: string) =>
    http<AuthResult & { isNewUser?: boolean }>(`${AUTH}/oauth/google`, {
      method: "POST",
      body: { idToken },
    }),

  // TASK-FE-02
  sendPhoneOtp: (phone: string) =>
    http<void>(`${AUTH}/phone/otp/send`, { method: "POST", body: { phone } }),

  verifyPhoneOtp: (phone: string, otp: string) =>
    http<OtpVerifyResult>(`${AUTH}/phone/otp/verify`, { method: "POST", body: { phone, otp } }),

  updateProfile: (token: string, data: { fullName: string; email?: string }) =>
    http<AuthUser>("/api/v1/users/me", { method: "PUT", body: data, token }),

  // TASK-FE-03
  forgotPassword: (identifier: string, channel: RecoveryChannel) =>
    http<void>(`${AUTH}/password/forgot`, { method: "POST", body: { identifier, channel } }),

  verifyResetOtp: (identifier: string, otp: string) =>
    http<{ resetToken: string }>(`${AUTH}/password/verify-otp`, {
      method: "POST",
      body: { identifier, otp },
    }),

  resetPassword: (resetToken: string, newPassword: string) =>
    http<void>(`${AUTH}/password/reset`, { method: "POST", body: { resetToken, newPassword } }),
};
