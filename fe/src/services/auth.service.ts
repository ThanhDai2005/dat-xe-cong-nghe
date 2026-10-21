import { api } from "@/lib/api";

// ── Kiểu dữ liệu ──────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  familyId?: string;
  expiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: { user: AuthUser; tokens: AuthTokens };
}

export const normalizeAuthUser = (user: any): AuthUser => ({
  id: String(user?.id ?? ""),
  fullName: user?.fullName ?? user?.full_name ?? "",
  email: user?.email ?? "",
  role: String(user?.role ?? "").toUpperCase(),
  status: String(user?.status ?? "").toUpperCase(),
});

// ── Lưu token & user vào localStorage ─────────────────────────────────────
export const saveTokens = (tokens: AuthTokens) => {
  localStorage.setItem("accessToken", tokens.accessToken);
  if (tokens.refreshToken) localStorage.setItem("refreshToken", tokens.refreshToken);
  if (tokens.familyId)     localStorage.setItem("familyId",     tokens.familyId);
  window.dispatchEvent(new Event("auth-change"));
};

export const saveUser = (user: AuthUser) => {
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
};

export const getUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("accessToken");
};

export const getAccessToken = () => localStorage.getItem("accessToken") ?? undefined;

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("familyId");
  window.dispatchEvent(new Event("auth-change"));
};

export const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("familyId");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-change"));
};

// ══════════════════════════════════════════════════════════════════════════
//  /api/auth — Auth APIs
// ══════════════════════════════════════════════════════════════════════════

/** POST /api/auth/v1/login — Đăng nhập email/SĐT hoặc OTP */
export const login = (data: {
  identifier?: string;
  password?: string;
  clientRole: string;
  authMethod?: "PASSWORD" | "OTP";
  otpCode?: string;
  otpSessionId?: string;
}) => api.post<AuthResponse>("/auth/v1/login", data);

/** POST /api/auth/register — Đăng ký tài khoản */
export const register = (data: {
  role: string;
  fullName: string;
  email?: string;
  phone: string;
  password: string;
  confirmPassword: string;
}) => api.post<{ success: boolean; message: string }>("/auth/register", data);

/** POST /api/auth/phone/otp/send — Gửi OTP SMS */
export const sendPhoneOtp = (data: {
  phone: string;
  purpose: string;
  clientRole: string;
}) => api.post<{ success: boolean; message: string; data: { otpSessionId: string } }>(
  "/auth/phone/otp/send", data
);

/** POST /api/auth/phone/otp/verify — Xác thực OTP và đăng nhập/tạo tài khoản */
export const verifyPhoneOtp = (data: {
  otpSessionId: string;
  phone: string;
  otpCode: string;
}) => api.post<AuthResponse>("/auth/phone/otp/verify", data);

/** POST /api/auth/refresh-token — Làm mới token */
export const refreshToken = (data: {
  userId: string;
  familyId: string;
  refreshToken: string;
}) => api.post<{ success: boolean; data: { tokens: AuthTokens } }>("/auth/refresh-token", data);

/** POST /api/auth/logout — Đăng xuất */
export const logout = (data: {
  familyId?: string;
  refreshToken?: string;
  allDevices?: boolean;
}) => api.post<{ success: boolean; message: string }>("/auth/logout", data, getAccessToken());

/** POST /api/auth/password/forgot — Quên mật khẩu */
export const forgotPassword = (data: {
  identifier: string;
  channel: string;
}) => api.post<{ success: boolean; message: string; data: { otpSessionId: string } }>(
  "/auth/password/forgot", data
);

/** POST /api/auth/password/verify — Xác thực OTP khôi phục mật khẩu */
export const verifyPasswordOtp = (data: {
  identifier: string;
  otpCode: string;
  purpose: string;
}) => api.post<{ success: boolean; data: { resetToken: string } }>(
  "/auth/password/verify", data
);

/** POST /api/auth/password/reset — Đặt lại mật khẩu mới */
export const resetPassword = (data: {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
}) => api.post<{ success: boolean; message: string }>("/auth/password/reset", data);

// ══════════════════════════════════════════════════════════════════════════
//  /api/v1/user — User APIs (cần accessToken)
// ══════════════════════════════════════════════════════════════════════════

/** GET /api/v1/user/profile */
export const getProfile = () =>
  api.get<{ success: boolean; data: AuthUser }>("/v1/user/profile", getAccessToken());

/** PATCH /api/v1/user/profile */
export const updateProfile = (data: { fullName?: string; email?: string; avatarUrl?: string }) =>
  api.patch<{ success: boolean; message: string }>("/v1/user/profile", data, getAccessToken());

/** PATCH /api/v1/user/password/change */
export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) => api.patch<{ success: boolean; message: string }>(
  "/v1/user/password/change", data, getAccessToken()
);
