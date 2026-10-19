import { api } from "@/lib/api";

/* =========================================================
   1. KIỂU DỮ LIỆU TÀI KHOẢN
   ========================================================= */

/**
 * Dữ liệu tài khoản đã được chuẩn hóa ở frontend.
 * account_id trong CSDL là BIGINT nên lưu dưới dạng string
 * để tránh mất độ chính xác.
 */
export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  status: string;
}

/**
 * Dữ liệu tài khoản có thể được backend trả về theo
 * snake_case (tên cột CSDL) hoặc camelCase.
 */
export interface DatabaseUser {
  account_id?: string | number;
  full_name?: string;
  phone?: string;
  email?: string;
  account_role?: string;
  account_status?: string;

  id?: string | number;
  fullName?: string;
  role?: string;
  status?: string;
}

/* =========================================================
   2. KIỂU DỮ LIỆU TOKEN
   ========================================================= */

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  familyId?: string;
  expiresIn: number;
}

/* =========================================================
   3. KIỂU DỮ LIỆU PHẢN HỒI API
   ========================================================= */

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser | DatabaseUser;
    tokens: AuthTokens;
  };
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

/* =========================================================
   4. CHUẨN HÓA DỮ LIỆU USER
   ========================================================= */

/**
 * Chuyển dữ liệu từ backend/CSDL sang cấu trúc AuthUser
 * thống nhất để frontend sử dụng.
 */
export const normalizeAuthUser = (
  raw: AuthUser | DatabaseUser
): AuthUser => {
  const user = raw as DatabaseUser;

  const accountId = user.account_id ?? user.id;

  if (accountId === undefined || accountId === null) {
    throw new Error("API không trả về account_id của tài khoản.");
  }

  return {
    id: String(accountId),
    fullName: user.full_name ?? user.fullName ?? "",
    phone: user.phone ?? "",
    email: user.email ?? "",
    role: user.account_role ?? user.role ?? "",
    status: user.account_status ?? user.status ?? "",
  };
};

/* =========================================================
   5. LƯU TOKEN VÀ THÔNG TIN NGƯỜI DÙNG
   ========================================================= */

/**
 * Lưu access token và các token tùy chọn.
 */
export const saveTokens = (tokens: AuthTokens): void => {
  localStorage.setItem("accessToken", tokens.accessToken);

  if (tokens.refreshToken) {
    localStorage.setItem("refreshToken", tokens.refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
  }

  if (tokens.familyId) {
    localStorage.setItem("familyId", tokens.familyId);
  } else {
    localStorage.removeItem("familyId");
  }

  window.dispatchEvent(new Event("auth-change"));
};

/**
 * Lưu thông tin tài khoản đã chuẩn hóa.
 */
export const saveUser = (user: AuthUser): void => {
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
};

/**
 * Lấy thông tin tài khoản đang đăng nhập.
 */
export const getUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem("user");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

/**
 * Kiểm tra trạng thái đăng nhập dựa trên access token.
 */
export const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem("accessToken"));
};

/**
 * Lấy access token hiện tại.
 */
export const getAccessToken = (): string | undefined => {
  return localStorage.getItem("accessToken") ?? undefined;
};

/**
 * Xóa các token, giữ lại thông tin user nếu cần.
 */
export const clearTokens = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("familyId");

  window.dispatchEvent(new Event("auth-change"));
};

/**
 * Xóa toàn bộ thông tin xác thực khi đăng xuất.
 */
export const clearAuth = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("familyId");
  localStorage.removeItem("user");

  window.dispatchEvent(new Event("auth-change"));
};

/* =========================================================
   6. ĐĂNG NHẬP BẰNG MẬT KHẨU
   POST /api/auth/v1/login
   ========================================================= */

export interface LoginRequest {
  identifier?: string;
  password?: string;
  clientRole: string;
  authMethod?: "PASSWORD" | "OTP";
  otpCode?: string;
  otpSessionId?: string;
}

export const login = (data: LoginRequest) => {
  return api.post<AuthResponse>("/auth/v1/login", data);
};

/* =========================================================
   7. ĐĂNG KÝ TÀI KHOẢN
   POST /api/auth/register
   ========================================================= */

export interface RegisterRequest {
  role: string;
  fullName: string;
  email?: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const register = (data: RegisterRequest) => {
  return api.post<ApiMessageResponse>("/auth/register", data);
};

/* =========================================================
   8. GỬI OTP ĐẾN SỐ ĐIỆN THOẠI
   POST /api/auth/phone/otp/send
   ========================================================= */

export interface SendPhoneOtpRequest {
  phone: string;
  purpose: string;
  clientRole: string;
}

export interface SendPhoneOtpResponse {
  success: boolean;
  message: string;
  data: {
    otpSessionId: string;
  };
}

export const sendPhoneOtp = (data: SendPhoneOtpRequest) => {
  return api.post<SendPhoneOtpResponse>(
    "/auth/phone/otp/send",
    data
  );
};

/* =========================================================
   9. XÁC THỰC OTP ĐIỆN THOẠI
   POST /api/auth/phone/otp/verify
   ========================================================= */

export interface VerifyPhoneOtpRequest {
  otpSessionId: string;
  phone: string;
  otpCode: string;
}

export const verifyPhoneOtp = (data: VerifyPhoneOtpRequest) => {
  return api.post<AuthResponse>(
    "/auth/phone/otp/verify",
    data
  );
};

/* =========================================================
   10. LÀM MỚI TOKEN
   POST /api/auth/refresh-token
   ========================================================= */

export interface RefreshTokenRequest {
  userId: string;
  familyId: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    tokens: AuthTokens;
  };
}

export const refreshToken = (data: RefreshTokenRequest) => {
  return api.post<RefreshTokenResponse>(
    "/auth/refresh-token",
    data
  );
};

/* =========================================================
   11. ĐĂNG XUẤT
   POST /api/auth/logout
   ========================================================= */

export interface LogoutRequest {
  familyId?: string;
  refreshToken?: string;
  allDevices?: boolean;
}

export const logout = (data: LogoutRequest) => {
  return api.post<ApiMessageResponse>(
    "/auth/logout",
    data,
    getAccessToken()
  );
};

/* =========================================================
   12. QUÊN MẬT KHẨU
   POST /api/auth/password/forgot
   ========================================================= */

export interface ForgotPasswordRequest {
  identifier: string;
  channel: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: {
    otpSessionId: string;
  };
}

export const forgotPassword = (data: ForgotPasswordRequest) => {
  return api.post<ForgotPasswordResponse>(
    "/auth/password/forgot",
    data
  );
};

/* =========================================================
   13. XÁC THỰC OTP KHÔI PHỤC MẬT KHẨU
   POST /api/auth/password/verify
   ========================================================= */

export interface VerifyPasswordOtpRequest {
  identifier: string;
  otpCode: string;
  purpose: string;
}

export interface VerifyPasswordOtpResponse {
  success: boolean;
  data: {
    resetToken: string;
  };
}

export const verifyPasswordOtp = (
  data: VerifyPasswordOtpRequest
) => {
  return api.post<VerifyPasswordOtpResponse>(
    "/auth/password/verify",
    data
  );
};

/* =========================================================
   14. ĐẶT LẠI MẬT KHẨU
   POST /api/auth/password/reset
   ========================================================= */

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const resetPassword = (data: ResetPasswordRequest) => {
  return api.post<ApiMessageResponse>(
    "/auth/password/reset",
    data
  );
};

/* =========================================================
   15. LẤY HỒ SƠ NGƯỜI DÙNG
   GET /api/v1/user/profile
   ========================================================= */

export interface ProfileResponse {
  success: boolean;
  data: AuthUser | DatabaseUser;
}

export const getProfile = () => {
  return api.get<ProfileResponse>(
    "/v1/user/profile",
    getAccessToken()
  );
};

/* =========================================================
   16. CẬP NHẬT HỒ SƠ
   PATCH /api/v1/user/profile
   ========================================================= */

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
}

export const updateProfile = (data: UpdateProfileRequest) => {
  return api.patch<ApiMessageResponse>(
    "/v1/user/profile",
    data,
    getAccessToken()
  );
};

/* =========================================================
   17. ĐỔI MẬT KHẨU
   PATCH /api/v1/user/password/change
   ========================================================= */

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const changePassword = (data: ChangePasswordRequest) => {
  return api.patch<ApiMessageResponse>(
    "/v1/user/password/change",
    data,
    getAccessToken()
  );
};