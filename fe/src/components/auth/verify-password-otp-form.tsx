import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { cn } from "cn";
import { toast } from "sonner";
import { verifyPasswordOtp, forgotPassword } from "@/services/auth.service";

const RESEND_COOLDOWN = 59;

export function VerifyPasswordOtpForm({ className }: React.ComponentProps<"div">) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { identifier = "", channel = "email", otpSessionId: _sid = "" } =
    (location.state as { identifier?: string; channel?: string; otpSessionId?: string }) || {};

  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCount] = useState(RESEND_COOLDOWN);
  const [resending, setResend]= useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { refs[0].current?.focus(); }, []);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    setErrorMsg("");
    if (v && i < 5) refs[i + 1].current?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) { setOtp(text.split("")); refs[5].current?.focus(); }
    e.preventDefault();
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResend(true);
    try {
      await forgotPassword({ identifier, channel });
      setOtp(["", "", "", "", "", ""]); setCount(RESEND_COOLDOWN); refs[0].current?.focus();
      toast.success("Đã gửi lại mã xác thực!");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Gửi lại thất bại");
    } finally { setResend(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { toast.error("Vui lòng nhập đủ 6 chữ số"); return; }
    setLoading(true);
    try {
      const res = await verifyPasswordOtp({ identifier, otpCode: code, purpose: "reset_password" });
      toast.success("Xác thực thành công!");
      navigate("/reset-password", { state: { resetToken: res.data?.resetToken, identifier } });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMsg(e?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.");
      setOtp(["", "", "", "", "", ""]); refs[0].current?.focus();
    } finally { setLoading(false); }
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="w-full max-w-6xl mx-auto py-2 md:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-xl bg-surface-container-lowest">

          {/* ── LEFT PANEL ── */}
          <div className="lg:col-span-5 bg-gradient-to-br from-primary to-primary-container p-9 lg:p-14 text-on-primary flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md">
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">verified_user</span>
                <span className="text-label-sm tracking-wider uppercase text-white font-semibold">Bảo mật cấp cao</span>
              </div>
              <span className="text-xs font-mono tracking-widest text-white/70">SEC-OTP // 256</span>
            </div>

            {/* Center Visual */}
            <div className="relative z-10 my-9 flex flex-col items-center text-center">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-white/15 shadow-inner" />
                {/* Shield + Lock */}
                <div className="relative z-10 w-28 h-36 bg-white rounded-t-full rounded-b-2xl shadow-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300">
                  <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  </div>
                  <div className="mt-2 w-2 h-2 rounded-full bg-primary animate-ping" />
                </div>
                {/* Left chip */}
                <div className="absolute left-0 bottom-6 px-3 py-2 rounded-xl bg-white text-on-surface shadow-lg flex items-center gap-2 -rotate-3 hover:rotate-0 transition-transform">
                  <div className="w-6 h-6 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[14px]">sms</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Mã SMS OTP</span>
                    <span className="text-[10px] font-mono font-bold text-primary tracking-widest">••••••</span>
                  </div>
                </div>
                {/* Right chip */}
                <div className="absolute right-0 top-6 px-3 py-2 rounded-xl bg-white text-on-surface shadow-lg flex items-center gap-2 rotate-3 hover:rotate-0 transition-transform">
                  <div className="w-6 h-6 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-on-surface uppercase tracking-tight">XÁC THỰC 2 LỚP</span>
                    <span className="text-[9px] font-bold text-tertiary">MÃ HÓA 256-BIT</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-headline-lg font-bold text-white tracking-tight">
                  Xác thực bảo vệ tài khoản
                </h2>
                <p className="mt-1 text-body-md text-white/80 max-w-sm mx-auto">
                  Nhập mã OTP để xác minh bạn là chủ sở hữu hợp pháp của tài khoản.
                </p>
              </div>
            </div>

            {/* Bottom Trust */}
            <div className="relative z-10 pt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">shield_lock</span>
                  <span className="text-label-md">Bảo mật mã hóa đa tầng</span>
                </div>
                <span className="text-xs font-semibold text-tertiary-fixed font-mono bg-white/10 px-2 py-0.5 rounded-full">TLS 1.3 Active</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-7 p-6 md:p-9 lg:p-14 flex flex-col justify-between bg-surface-container-lowest">
            <div>
              {/* Nav */}
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Quay lại nhập thông tin</span>
                </button>
                <span className="inline-flex items-center gap-1 text-xs text-label-md text-tertiary bg-on-tertiary-container/30 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  Đường truyền bảo mật
                </span>
              </div>

              {/* Headings */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high text-primary text-label-sm uppercase tracking-wide font-bold mb-1">
                  <span className="material-symbols-outlined text-[16px]">pin</span>
                  <span>Bước 02 / 03: Xác thực bảo mật</span>
                </div>
                <h1 className="text-headline-lg text-on-surface tracking-tight font-extrabold mt-1">
                  Xác thực yêu cầu khôi phục
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1.5">
                  Nhập mã xác thực gồm 6 chữ số đã được gửi đến thông tin liên hệ của bạn:
                </p>
              </div>

              {/* Masked Identifier Badge */}
              <div className="mb-6 p-4 rounded-xl bg-surface-container-low flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[22px]">
                      {channel === "sms" ? "phone_iphone" : "mail"}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-label-sm uppercase tracking-wider text-on-surface-variant">Đã gửi mã đến số</span>
                    <div className="flex items-center gap-2">
                      <span className="text-headline-sm tracking-wider text-on-surface font-mono font-bold truncate">
                        {identifier}
                      </span>
                      <span className="text-xs bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-medium hidden sm:inline">
                        {channel === "sms" ? "SMS OTP" : "EMAIL OTP"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container text-primary text-label-md transition-colors"
                  title="Thay đổi"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span className="hidden sm:inline">Thay đổi</span>
                </button>
              </div>

              {/* OTP Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                      <span>MÃ XÁC THỰC OTP (6 SỐ)</span>
                      <span className="text-error font-bold">*</span>
                    </label>
                  </div>

                  {/* 6 OTP boxes */}
                  <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={refs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        pattern="[0-9]*"
                        value={digit}
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className={cn(
                          "w-full aspect-square text-center text-headline-lg font-bold font-mono rounded-xl bg-surface-container-low text-on-surface shadow-inner focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all duration-200",
                          errorMsg && "border-2 border-error"
                        )}
                      />
                    ))}
                  </div>

                  {/* Error Banner */}
                  {errorMsg && (
                    <div className="mt-3 p-3 rounded-xl bg-error-container text-on-error-container flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-error flex-shrink-0 mt-0.5">warning</span>
                      <div className="flex-1 text-sm leading-tight">
                        <span className="font-semibold block">Mã xác thực không đúng</span>
                        <span className="text-xs opacity-90">{errorMsg}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Countdown + Resend */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 p-2 rounded-xl bg-surface-container">
                  <div className="flex items-center gap-2 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span>Gửi lại mã xác thực sau:</span>
                    <span className="font-mono font-bold text-primary">{pad(Math.floor(countdown / 60))}:{pad(countdown % 60)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || resending}
                    className={cn(
                      "text-label-md flex items-center gap-1 transition-colors",
                      countdown > 0 ? "text-outline cursor-not-allowed opacity-50" : "text-primary hover:text-primary-container"
                    )}
                  >
                    <span className={cn("material-symbols-outlined text-[16px]", resending && "animate-spin")}>refresh</span>
                    <span>{resending ? "Đang gửi..." : "Gửi lại mã"}</span>
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full h-12 rounded-xl bg-primary-container text-on-primary text-headline-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-primary active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-container"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" />
                      </svg>
                      <span>Đang xử lý xác minh...</span>
                    </>
                  ) : (
                    <>
                      <span>Xác nhận mã</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 rounded-xl bg-surface-container-low text-on-surface flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0 mt-0.5">security</span>
              <div className="text-xs leading-relaxed text-on-surface-variant">
                <span className="font-bold text-on-surface block mb-0.5">Lưu ý quan trọng:</span>
                Tuyệt đối không chia sẻ mã OTP với bất kỳ ai, kể cả nhân viên chăm sóc khách hàng hay tổng đài GoRide. Mã xác thực chỉ có hiệu lực một lần duy nhất.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full mt-4 px-4 pb-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-body-sm text-on-surface-variant">© 2025 GoRide Technology Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-body-sm text-on-surface-variant">
            <Link to="/terms" className="hover:text-primary transition-colors">Điều khoản &amp; Dịch vụ</Link>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <Link to="/privacy" className="hover:text-primary transition-colors">Bảo mật thông tin</Link>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <Link to="/support" className="hover:text-primary transition-colors">Trung tâm hỗ trợ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
