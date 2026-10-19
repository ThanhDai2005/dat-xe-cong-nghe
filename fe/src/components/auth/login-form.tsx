
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Phone,
  ArrowRight,
  CarFront,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

import {
  login,
  sendPhoneOtp,
  verifyPhoneOtp,
  saveTokens,
  saveUser,
  normalizeAuthUser,
} from "@/services/auth.service";

import type {
  AuthResponse,
  AuthUser,
} from "@/services/auth.service";

interface LoginFormProps {
  className?: string;
  redirectTo?: string;
}

type LoginMethod = "password" | "otp";

/**
 * Chỉ cho phép chuyển hướng đến đường dẫn nội bộ.
 * Không cho phép quay lại trang login để tránh vòng lặp.
 */
function getSafeRedirect(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\") ||
    value === "/login" ||
    value.startsWith("/login?")
  ) {
    return "/home";
  }

  return value;
}

export function LoginForm({
  className = "",
  redirectTo,
}: LoginFormProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // redirectTo từ LoginPage được ưu tiên; nếu không có thì lấy từ URL.
  const queryRedirect = new URLSearchParams(location.search).get("redirect");

  const safeRedirect = getSafeRedirect(
    redirectTo || queryRedirect || "/home",
  );

  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) {
      return err.message;
    }

    return fallback;
  };

  /**
   * Xử lý đăng nhập thành công cho cả mật khẩu và OTP.
   */
  const completeLogin = (response: AuthResponse) => {
    if (!response?.success) {
      throw new Error(
        response?.message || "Đăng nhập không thành công.",
      );
    }

    const userData = response.data?.user;
    const tokens = response.data?.tokens;

    if (!userData || !tokens?.accessToken) {
      throw new Error(
        "Dữ liệu đăng nhập không hợp lệ. Vui lòng thử lại.",
      );
    }

    const user: AuthUser = normalizeAuthUser(userData);

    if (!user.id) {
      throw new Error("Không tìm thấy mã tài khoản.");
    }

    const status = user.status.trim().toUpperCase();

    if (
      status &&
      !["ACTIVE", "ACTIVED", "ENABLED"].includes(status)
    ) {
      throw new Error(
        "Tài khoản hiện không hoạt động. Vui lòng liên hệ hỗ trợ.",
      );
    }

    // Lưu token và thông tin người dùng trước khi chuyển trang.
    saveTokens(tokens);
    saveUser(user);

    setError("");
    setSuccess("Đăng nhập thành công!");

    // Nếu xuất phát từ đặt xe, quay lại đúng BookingPage kèm query.
    navigate(safeRedirect, { replace: true });
  };

  const handleChangeMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    setError("");
    setSuccess("");
  };

  /**
   * Đăng nhập bằng email/số điện thoại và mật khẩu.
   */
  const handlePasswordLogin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const value = identifier.trim();

    if (!value) {
      setError("Vui lòng nhập email hoặc số điện thoại.");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        identifier: value,
        password,
        clientRole: "CUSTOMER",
        authMethod: "PASSWORD",
      });

      completeLogin(response);
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Không thể đăng nhập. Vui lòng thử lại.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gửi mã OTP đến điện thoại.
   */
  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    try {
      setLoading(true);

      const response = await sendPhoneOtp({
        phone: normalizedPhone,
        purpose: "LOGIN",
        clientRole: "CUSTOMER",
      });

      if (!response?.success || !response.data?.otpSessionId) {
        throw new Error(
          response?.message || "Không thể gửi mã OTP.",
        );
      }

      setOtpSessionId(response.data.otpSessionId);
      setOtpSent(true);
      setOtpCode("");

      setSuccess(
        response.message || "Mã OTP đã được gửi đến điện thoại.",
      );
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Không thể gửi OTP. Vui lòng thử lại.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xác thực OTP và đăng nhập.
   */
  const handleOtpLogin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!otpSessionId) {
      setError("Vui lòng yêu cầu gửi mã OTP trước.");
      return;
    }

    if (!otpCode.trim()) {
      setError("Vui lòng nhập mã OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyPhoneOtp({
        otpSessionId,
        phone: phone.trim(),
        otpCode: otpCode.trim(),
      });

      completeLogin(response);
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Mã OTP không hợp lệ hoặc đã hết hạn.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex w-full items-center justify-center ${className}`}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl md:grid-cols-2">
        {/* Khu vực giới thiệu */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-green-500 via-green-700 to-emerald-900 p-10 text-white md:flex">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10" />

          <Link
            to="/home"
            className="relative z-10 inline-flex w-fit items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-green-700 shadow-lg">
              <CarFront size={28} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight">
              GoRide
            </span>
          </Link>

          <div className="relative z-10 py-12">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
              <ShieldCheck size={17} />
              Di chuyển an toàn, tiện lợi
            </span>

            <h1 className="mb-5 text-4xl font-extrabold leading-tight lg:text-5xl">
              Bắt đầu hành trình của bạn
            </h1>

            <p className="max-w-md leading-7 text-green-50">
              Đăng nhập GoRide để đặt xe nhanh chóng, quản lý
              chuyến đi và theo dõi hành trình của bạn.
            </p>
          </div>

          <p className="relative z-10 text-sm text-green-100">
            © {new Date().getFullYear()} GoRide. Đồng hành cùng mọi hành trình.
          </p>
        </div>

        {/* Biểu mẫu đăng nhập */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8">
            <Link
              to="/home"
              className="mb-6 inline-flex items-center gap-2 font-bold text-green-700 md:hidden"
            >
              <CarFront size={28} />
              <span className="text-xl">GoRide</span>
            </Link>

            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Chào mừng trở lại!
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Đăng nhập để tiếp tục sử dụng dịch vụ GoRide.
            </p>
          </div>

          {/* Chọn phương thức đăng nhập */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => handleChangeMethod("password")}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                loginMethod === "password"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <LockKeyhole size={17} />
              Mật khẩu
            </button>

            <button
              type="button"
              onClick={() => handleChangeMethod("otp")}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                loginMethod === "otp"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Phone size={17} />
              OTP điện thoại
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700"
            >
              {success}
            </div>
          )}

          {/* Đăng nhập bằng mật khẩu */}
          {loginMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email hoặc số điện thoại
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="login-identifier"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="Nhập email hoặc số điện thoại"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Mật khẩu
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-green-700 hover:text-green-800"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-green-700"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Đăng nhập bằng OTP */}
          {loginMethod === "otp" && (
            <form onSubmit={handleOtpLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="login-phone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Số điện thoại
                </label>

                <div className="relative">
                  <Phone
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="login-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setOtpSent(false);
                      setOtpSessionId("");
                      setOtpCode("");
                    }}
                    placeholder="Nhập số điện thoại"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                    required
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <label
                    htmlFor="login-otp"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Mã OTP
                  </label>
                  <input
                    id="login-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(event) =>
                      setOtpCode(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="Nhập mã OTP"
                    maxLength={6}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm tracking-[0.3em] outline-none transition placeholder:tracking-normal placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                    required
                  />
                </div>
              )}

              {!otpSent ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendOtp}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={19} className="animate-spin" />
                      Đang gửi mã...
                    </>
                  ) : (
                    <>
                      Gửi mã OTP
                      <ArrowRight size={19} />
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={19} className="animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        Xác nhận và đăng nhập
                        <ArrowRight size={19} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSendOtp}
                    className="w-full py-2 text-sm font-semibold text-green-700 transition hover:text-green-800 disabled:opacity-60"
                  >
                    Gửi lại mã OTP
                  </button>
                </>
              )}
            </form>
          )}

          <p className="mt-7 text-center text-sm text-gray-500">
            Bạn chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-bold text-green-700 hover:text-green-800"
            >
              Đăng ký ngay
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={15} />
            Thông tin của bạn được bảo vệ an toàn
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
