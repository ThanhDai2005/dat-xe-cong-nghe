import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { cn } from "cn";
import { toast } from "sonner";
import { login, sendPhoneOtp, saveTokens, saveUser } from "@/services/auth.service";

type Mode = "password" | "otp";

export const LoginForm = ({ className }: React.ComponentProps<"div">) => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("password");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password mode state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // OTP mode state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");

  // ── Password login ────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ identifier, password, clientRole: "CUSTOMER" }) as unknown as Record<string, unknown>;
      // Hỗ trợ cả 2 cấu trúc: { data: { tokens, user } } hoặc { tokens, user }
      const tokens = (res as { data?: { tokens?: unknown } })?.data?.tokens
                  || (res as { tokens?: unknown })?.tokens;
      const user = (res as { data?: { user?: unknown } })?.data?.user
                || (res as { user?: unknown })?.user;
      if (tokens) saveTokens(tokens as Parameters<typeof saveTokens>[0]);
      if (user) saveUser(user as Parameters<typeof saveUser>[0]);
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err: unknown) {
      const e = err as { message?: string; error?: string };
      toast.error(e?.message || e?.error || "Thông tin đăng nhập không chính xác");
    } finally { setLoading(false); }
  };

  // ── OTP login ─────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!phone) { toast.error("Vui lòng nhập số điện thoại"); return; }
    setLoading(true);
    try {
      const res = await sendPhoneOtp({ phone, purpose: "login", clientRole: "CUSTOMER" });
      setOtpSessionId(res.data?.otpSessionId || "");
      setOtpSent(true);
      toast.success("Đã gửi mã OTP!");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Gửi OTP thất bại");
    } finally { setLoading(false); }
  };

  const handleOtpVerify = async () => {
    if (otpCode.length < 6) { toast.error("Nhập đủ 6 chữ số OTP"); return; }
    setLoading(true);
    try {
      const res = await login({ identifier: phone, otpCode, otpSessionId, authMethod: "OTP", clientRole: "CUSTOMER" }) as unknown as Record<string, unknown>;
      const tokens = (res as { data?: { tokens?: unknown } })?.data?.tokens
                  || (res as { tokens?: unknown })?.tokens;
      const user = (res as { data?: { user?: unknown } })?.data?.user
                || (res as { user?: unknown })?.user;
      if (tokens) saveTokens(tokens as Parameters<typeof saveTokens>[0]);
      if (user) saveUser(user as Parameters<typeof saveUser>[0]);
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Mã OTP không đúng hoặc đã hết hạn");
    } finally { setLoading(false); }
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {/* Ambient radial background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(64,194,253,0.18),rgba(250,248,255,0))] opacity-90" />

      <div className="flex flex-col w-full items-center justify-center max-w-6xl mx-auto my-auto">
        {/* Main Split Card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">

          {/* ── LEFT PANEL ── */}
          <div
            className="lg:col-span-5 p-9 flex flex-col justify-between relative overflow-hidden text-white"
            style={{ background: "linear-gradient(150deg, rgb(9,64,153) 0%, rgb(29,104,242) 60%, rgb(6,43,105) 100%)" }}
          >
            {/* Ambient blobs */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top slogan */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm shadow-sm">
                🚗 DỊCH VỤ GỌI XE CÔNG NGHỆ GORIDE
              </span>
              <h2 className="text-3xl lg:text-4xl text-white leading-tight tracking-tight mt-4 mb-3 font-bold"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>
                Kết nối chuyến đi an toàn &amp; minh bạch.
              </h2>
              <p className="text-body-md text-white/90 max-w-sm">
                Nền tảng di chuyển công nghệ tiện lợi, chuẩn xác và tin cậy hàng đầu Việt Nam.
              </p>
            </div>

            {/* Illustration */}
            <div className="relative z-10 my-auto py-2 flex items-center justify-center">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1WlwmesPy8TxrP4mpAWxg7fhMhSkRncFbRDlERUlsWDaW-bqtFD8iGGA0ZFvmJhIhA9D4JF1j58-CRSkKadwU_7O4Uya8OP8dv9amgwyZ5G-YrbJUZf8oVNx0Agbazm54BQnQYRJb2U3Ti5jQYtFapEUx36N4S1jYKmF3mcPEFWU3O60-nm30W--xb4wAL1nU15gcAU4zKrwBCl4EC2GKujZTBIB1oCCf5p1r3PoXnRZ-hWw7gZBf4EyA"
                alt="Minh họa GoRide"
                loading="lazy"
                decoding="async"
                className="w-60 h-60 object-contain mx-auto my-6 drop-shadow-xl"
              />
            </div>

            {/* Bottom trust badge */}
            <div className="relative z-10 pt-2">
              <div
                className="p-4 rounded-xl backdrop-blur-md shadow-sm flex items-center justify-between text-white"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div>
                    <p className="text-headline-sm font-bold text-white leading-tight">
                      ⭐ 4.9/5 • Hơn 2.5 triệu chuyến đi thành công
                    </p>
                    <p className="text-label-sm text-white/90 mt-0.5">Đối tác tin cậy tại 63 tỉnh thành</p>
                  </div>
                </div>
                <div className="hidden sm:flex -space-x-2">
                  {["HN", "SG", "ĐN"].map((city, i) => (
                    <span key={city}
                      className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm border border-white/30",
                        i === 0 ? "bg-secondary" : i === 1 ? "bg-primary" : "bg-tertiary")}>
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between bg-surface-container-lowest">
            <div className="max-w-md w-full mx-auto my-auto">

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-headline-lg text-on-surface font-bold tracking-tight mb-1">
                  Chào mừng bạn trở lại
                </h1>
                <p className="text-body-md text-on-surface-variant">
                  Đăng nhập vào tài khoản GoRide để quản lý và theo dõi chuyến đi của bạn.
                </p>
              </div>

              {/* Tab switcher */}
              <div className="flex p-1 bg-surface-container-low rounded-xl mb-6 gap-1">
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className={cn(
                    "flex-1 py-2 px-2 rounded-lg text-label-md font-semibold flex items-center justify-center gap-1 transition-all",
                    mode === "password"
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>Mật khẩu</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("otp"); setOtpSent(false); setOtpCode(""); }}
                  className={cn(
                    "flex-1 py-2 px-2 rounded-lg text-label-md font-medium flex items-center justify-center gap-1 transition-all",
                    mode === "otp"
                      ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                  <span>Mã OTP qua SMS</span>
                </button>
              </div>

              {/* ── PASSWORD MODE ── */}
              {mode === "password" && (
                <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                  {/* Identifier */}
                  <div>
                    <label className="block text-label-md text-on-surface font-medium mb-1.5" htmlFor="identifier">
                      Email hoặc số điện thoại <span className="text-error font-bold">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant pointer-events-none text-[20px]">alternate_email</span>
                      <input
                        id="identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="0912345678 hoặc customer@email.com"
                        required
                        className="w-full h-12 pl-11 pr-4 bg-surface-container-low rounded-xl text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_4px_rgba(29,104,242,0.12)] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-label-md text-on-surface font-medium" htmlFor="login-password">
                        Mật khẩu <span className="text-error font-bold">*</span>
                      </label>
                      <Link to="/forgot-password" className="text-label-md text-primary hover:underline transition-colors">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant pointer-events-none text-[20px]">lock</span>
                      <input
                        id="login-password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu của bạn"
                        required
                        className="w-full h-12 pl-11 pr-12 bg-surface-container-low rounded-xl text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_4px_rgba(29,104,242,0.12)] transition-all"
                      />
                      <button type="button" aria-label="Hiển thị hoặc ẩn mật khẩu"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 rounded-lg focus:outline-none">
                        <span className="material-symbols-outlined text-[20px]">
                          {showPw ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-low accent-primary cursor-pointer" />
                      <span className="text-body-sm text-on-surface-variant">Ghi nhớ đăng nhập trên thiết bị này</span>
                    </label>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary text-label-lg font-medium flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                        </svg>
                        <span>Đang kết nối GoRide...</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Đăng nhập</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* ── OTP MODE ── */}
              {mode === "otp" && (
                <div className="space-y-4">
                  {/* Phone input */}
                  <div>
                    <label className="block text-label-md text-on-surface font-medium mb-1.5" htmlFor="otp-phone">
                      Số điện thoại di động <span className="text-error font-bold">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1 text-on-surface-variant pointer-events-none select-none">
                        <span className="text-label-md font-semibold text-primary">+84</span>
                        <span className="h-4 w-[1px] bg-outline-variant inline-block ml-1" />
                      </div>
                      <input
                        id="otp-phone" type="tel"
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="912 345 678"
                        className="w-full h-12 pl-16 pr-4 bg-surface-container-low rounded-xl text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_4px_rgba(29,104,242,0.12)] transition-all"
                      />
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">sms</span>
                      Mã xác thực 6 chữ số sẽ được gửi qua tin nhắn SMS tới số này.
                    </p>
                  </div>

                  {/* OTP field after send */}
                  {otpSent && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-label-md text-on-surface font-medium" htmlFor="otp-input">
                          Mã OTP (6 số) <span className="text-error font-bold">*</span>
                        </label>
                        <button type="button" onClick={handleSendOtp} className="text-label-md text-primary hover:underline">
                          Gửi lại mã
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant pointer-events-none text-[20px]">pin</span>
                        <input
                          id="otp-input" type="text" inputMode="numeric" maxLength={6}
                          value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="______"
                          className="w-full h-12 pl-11 pr-4 bg-surface-container-low rounded-xl text-body-md text-on-surface placeholder:text-outline tracking-widest font-semibold focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_4px_rgba(29,104,242,0.12)] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!otpSent ? (
                    <button type="button" onClick={handleSendOtp} disabled={loading}
                      className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary text-label-lg font-medium flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60">
                      <span className="material-symbols-outlined text-[20px]">send_to_mobile</span>
                      <span>{loading ? "Đang gửi..." : "Gửi mã xác thực SMS OTP"}</span>
                    </button>
                  ) : (
                    <button type="button" onClick={handleOtpVerify} disabled={loading}
                      className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary text-label-lg font-medium flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60">
                      <span className="material-symbols-outlined text-[20px]">verified_user</span>
                      <span>{loading ? "Đang xác thực..." : "Xác thực OTP & Đăng nhập"}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full bg-surface-container-high h-[1px]" />
                </div>
                <span className="relative px-3 bg-surface-container-lowest text-label-sm text-outline uppercase tracking-wider">
                  hoặc tiếp tục với
                </span>
              </div>

              {/* Google OAuth */}
              <button type="button"
                className="w-full h-12 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low active:scale-[0.99] shadow-sm flex items-center justify-center gap-3 text-label-lg text-on-surface transition-all cursor-pointer border border-surface-container-high">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Đăng nhập với Google</span>
              </button>

              {/* Register link */}
              <p className="text-center mt-5 text-body-md text-on-surface-variant">
                Chưa có tài khoản?
                <Link to="/register" className="text-label-lg text-primary hover:underline font-semibold ml-1">
                  Đăng ký ngay
                </Link>
              </p>

              {/* Trust badge */}
              <div className="mt-4 p-3 rounded-xl bg-surface-container-low flex items-center justify-center gap-2 text-center">
                <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
                <span className="text-body-sm text-on-surface-variant">
                  Thông tin tài khoản được mã hóa và bảo mật theo chuẩn an toàn GoRide.
                </span>
              </div>

              {/* Sub-footer links */}
              <div className="pt-4 mt-4 flex items-center justify-between text-body-sm text-outline">
                <Link to="/privacy" className="hover:text-primary transition-colors">Chính sách bảo mật</Link>
                <span className="inline-block w-1 h-1 rounded-full bg-outline" />
                <Link to="/terms" className="hover:text-primary transition-colors">Điều khoản sử dụng</Link>
                <span className="inline-block w-1 h-1 rounded-full bg-outline" />
                <Link to="/support" className="hover:text-primary transition-colors">Trợ giúp</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
