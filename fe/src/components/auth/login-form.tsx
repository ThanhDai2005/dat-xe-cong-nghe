import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowRight, AtSign, KeyRound, MessageSquareText } from "lucide-react";
import { cn } from "cn";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/http";
import { normalizeVnPhone } from "@/lib/auth-utils";
import { AuthAlert, AuthInput, FieldLabel, PasswordInput, PrimaryButton } from "./AuthField";
import { GoogleLoginButton } from "./GoogleLoginButton";

type Method = "password" | "otp";

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const from: string = location.state?.from ?? "/";

  const [method, setMethod] = useState<Method>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fail = (err: unknown, fallback: string) =>
    setError(err instanceof ApiError ? err.message : fallback);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return setError("Vui lòng nhập tên tài khoản và mật khẩu.");
    setError("");
    setLoading(true);
    try {
      const result = await authService.login(username.trim(), password);
      setSession(result, remember);
      navigate(from, { replace: true });
    } catch (err) {
      fail(err, "Thông tin đăng nhập không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const e164 = normalizeVnPhone(phone);
    if (!e164) return setError("Vui lòng nhập số điện thoại di động hợp lệ (9–10 chữ số).");
    setError("");
    setLoading(true);
    try {
      await authService.sendPhoneOtp(e164);
      navigate("/verify-otp", { state: { phone: e164, from } });
    } catch (err) {
      fail(err, "Không thể gửi mã OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async (idToken: string) => {
    setError("");
    setLoading(true);
    try {
      const result = await authService.googleLogin(idToken);
      setSession(result, true);
      navigate(result.isNewUser ? "/complete-profile" : from, { replace: true });
    } catch (err) {
      fail(err, "Đăng nhập Google thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const tab = (m: Method, label: string, Icon: typeof KeyRound) => (
    <button
      type="button"
      onClick={() => { setMethod(m); setError(""); }}
      className={cn(
        "flex-1 py-2 px-2 rounded-lg text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer",
        method === m ? "font-semibold text-[#0050c8] bg-white shadow-sm" : "font-medium text-[#424655] hover:text-[#131b2e]",
      )}
    >
      <Icon className="w-[18px] h-[18px]" /> {label}
    </button>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[2rem] leading-tight font-bold tracking-tight mb-1">Chào mừng bạn trở lại</h1>
        <p className="text-[15px] text-[#424655]">Đăng nhập vào tài khoản GoRide để quản lý và theo dõi chuyến đi của bạn.</p>
      </div>

      {error && <AuthAlert variant="error" title="Không thể đăng nhập">{error}</AuthAlert>}

      <div className="flex p-1 gap-1 mb-4 rounded-xl bg-[#f2f3ff]">
        {tab("password", "Mật khẩu", KeyRound)}
        {tab("otp", "Mã OTP qua SMS", MessageSquareText)}
      </div>

      {method === "password" ? (
        <form onSubmit={submitPassword} className="space-y-4" noValidate>
          <div>
            <FieldLabel htmlFor="username" required>Tên tài khoản</FieldLabel>
            <AuthInput id="username" icon={AtSign} value={username} autoComplete="username"
              onChange={(e) => setUsername(e.target.value)} placeholder="0912345678 hoặc customer@email.com" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-[13px] font-semibold">
                Mật khẩu <span className="text-[#ba1a1a] font-bold">*</span>
              </label>
              <Link to="/forgot-password" className="text-[13px] font-semibold text-[#0050c8] hover:underline">Quên mật khẩu?</Link>
            </div>
            <PasswordInput id="password" value={password} autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu của bạn" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none text-[13px] text-[#424655]">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0050c8] cursor-pointer" />
            Ghi nhớ đăng nhập trên thiết bị này
          </label>
          <PrimaryButton type="submit" loading={loading} loadingText="Đang kết nối GoRide...">
            Đăng nhập <ArrowRight className="w-[18px] h-[18px]" />
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="space-y-4" noValidate>
          <div>
            <FieldLabel htmlFor="otp-phone" required>Số điện thoại di động</FieldLabel>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 flex items-center gap-2 text-[13px] font-semibold text-[#0050c8] pointer-events-none">
                +84 <span className="h-4 w-px bg-[#c2c6d7]" />
              </span>
              <input id="otp-phone" type="tel" inputMode="tel" value={phone} autoComplete="tel-national"
                onChange={(e) => setPhone(e.target.value)} placeholder="912 345 678"
                className="w-full h-12 pl-16 pr-4 rounded-xl bg-[#f2f3ff] text-[15px] placeholder:text-[#737686] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#0050c8]" />
            </div>
            <p className="mt-1.5 text-[13px] text-[#424655] flex items-center gap-1">
              <MessageSquareText className="w-4 h-4 text-[#006645]" />
              Mã xác thực 6 chữ số sẽ được gửi qua tin nhắn SMS tới số này.
            </p>
          </div>
          <PrimaryButton type="submit" loading={loading} loadingText="Đang gửi mã...">
            Gửi mã xác thực SMS OTP
          </PrimaryButton>
        </form>
      )}

      <div className="relative my-5 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-[#e2e7ff]" /></div>
        <span className="relative px-2 bg-white text-[11px] uppercase tracking-wider text-[#737686] font-bold">hoặc tiếp tục với</span>
      </div>

      <GoogleLoginButton onCredential={onGoogle} onError={setError} disabled={loading} />

      <p className="mt-5 text-center text-[15px] text-[#424655]">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-[#0050c8] hover:underline">Đăng ký ngay</Link>
      </p>
    </>
  );
};
