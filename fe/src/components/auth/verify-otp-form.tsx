import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { cn } from "cn";
import { toast } from "sonner";
import { verifyPhoneOtp, sendPhoneOtp, saveTokens } from "@/services/auth.service";

export function VerifyOtpForm({ className }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone = "+84 912 ••• 678", purpose = "register", otpSessionId: initSession = "" } =
    (location.state as { phone?: string; purpose?: string; otpSessionId?: string }) || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(initSession ? 59 : 0);
  const [canResend, setCanResend] = useState(!initSession);
  const [error, setError] = useState("");
  const [otpSessionId, setOtpSessionId] = useState(initSession);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const maskedPhone = phone.replace(/(\+84\s?)(\d{3})(\d{3})(\d{3})/, "+84 $2 ••• $4");

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setError("");
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = [...otp];
    digits.forEach((d, idx) => { if (idx < 6) next[idx] = d; });
    setOtp(next);
    const lastIdx = Math.min(digits.length, 5);
    inputRefs.current[lastIdx]?.focus();
  };

  const handleResend = async () => {
    try {
      const res = await sendPhoneOtp({ phone, purpose, clientRole: "CUSTOMER" });
      setOtpSessionId(res.data?.otpSessionId || "");
      setCountdown(59);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success("Đã gửi lại mã OTP!");
    } catch {
      toast.error("Gửi lại thất bại");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (!otpSessionId) { setError("Vui lòng gửi mã OTP trước."); return; }
    if (code.length < 6) { setError("Vui lòng nhập đủ 6 chữ số mã OTP."); return; }
    setLoading(true);
    try {
      const result = await verifyPhoneOtp({ phone, otpCode: code, otpSessionId });
      saveTokens(result.data.tokens);
      toast.success("Xác thực thành công!");
      if (purpose === "register") navigate("/");
      else navigate("/reset-password", { state: { phone, resetToken: otpSessionId } });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally { setLoading(false); }
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="flex flex-col w-full max-w-6xl mx-auto my-auto items-center justify-center p-2 sm:p-4">
        {/* Main card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">

          {/* ── LEFT PANEL ── */}
          <div
            className="lg:col-span-5 p-9 sm:p-14 text-on-primary flex flex-col justify-between relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1d68f2 0%, #0050c8 50%, #002979 100%)" }}
          >
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-fixed/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top badge */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                🔒 BẢO MẬT TÀI KHOẢN TỐI ĐA
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mt-4 mb-3">
                Bảo mật tài khoản của bạn tuyệt đối với xác thực OTP.
              </h2>
            </div>

            {/* Illustration */}
            <div className="w-full max-w-sm mx-auto my-6 drop-shadow-2xl flex items-center justify-center relative z-10">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1WME0Nsfo54WXG3IJOXfhVIidJ6XtGQ-l7SAA_w8TQWv-RJPHINUVeiz-u3pJi16rJGIOlZiqc0BOH77D3foJ2EVMMSf6AOuZibYDTFeSyOEUB7aCan-EIHxwMKQJNJuEypJHMMgVpGWncIDuJXX26ezA-MA1BnGb48LjrSPaHqm6HCPIZCuO-ErVHuBcWLz7V8QcHCowRQ1Pd7eMwN4RqQPVsXyyi7wv4vxcm3FfMoHjqWHChOY1MKkmY"
                alt="GoRide OTP Shield Security Illustration"
                loading="lazy" decoding="async"
                className="w-full h-auto max-h-64 object-contain"
              />
            </div>

            {/* Bottom badge */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white/90 text-xs font-medium">
                🛡️ Tiêu chuẩn mã hóa 256-bit chuẩn ISO/IEC 27001
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-7 p-6 sm:p-14 flex flex-col justify-between bg-surface-container-lowest relative">
            <div className="max-w-md w-full mx-auto flex flex-col justify-center h-full">

              {/* GoRide logo header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[24px]">local_taxi</span>
                  </div>
                  <span className="text-headline-sm tracking-tight font-extrabold text-on-surface">
                    Go<span className="text-primary-container">Ride</span>
                  </span>
                </div>
                <h1 className="text-headline-md text-on-surface tracking-tight mb-1">Xác thực mã OTP</h1>
                <div className="text-on-surface-variant text-body-md space-y-1">
                  <p>Mã xác thực gồm 6 chữ số đã được gửi qua SMS đến số điện thoại:</p>
                  <div className="inline-flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg mt-1">
                    <span className="text-on-surface font-semibold text-[15px] tracking-wide">{maskedPhone}</span>
                    <Link to="/login" title="Thay đổi số điện thoại"
                      className="inline-flex items-center text-primary-container hover:text-primary transition-colors p-1 rounded-md hover:bg-surface-container">
                      <span className="material-symbols-outlined text-[18px]">edit_square</span>
                    </Link>
                  </div>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* 6 OTP boxes */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-2 sm:gap-3" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        autoFocus={i === 0}
                        className={cn(
                          "w-12 h-14 sm:w-14 sm:h-16 text-center text-headline-md text-on-surface rounded-xl focus:outline-none transition-all duration-150 shadow-sm",
                          digit ? "bg-primary-fixed text-on-primary-fixed focus:shadow-[0_0_0_2px_#0050c8]" : "bg-surface-container-low focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#0050c8]",
                          error && !digit ? "bg-error-container" : ""
                        )}
                      />
                    ))}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Resend */}
                <div className="flex items-center justify-between text-on-surface-variant text-body-sm">
                  {!canResend ? (
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-outline">timer</span>
                      <span>Gửi lại mã sau <strong className="text-primary-container font-semibold">00:{String(countdown).padStart(2, "0")}</strong></span>
                    </span>
                  ) : (
                    <button type="button" onClick={handleResend}
                      className="text-label-md text-primary-container hover:text-primary font-bold flex items-center gap-1 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      Gửi lại mã OTP qua SMS
                    </button>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 hover:bg-primary text-on-primary rounded-xl text-headline-sm text-[16px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] bg-primary-container disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Xác nhận &amp; Tiếp tục</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </>
                  )}
                </button>

                {/* Back link */}
                <div className="flex items-center justify-center">
                  <Link to="/login"
                    className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-label-md transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Quay lại Đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-5 px-4 mt-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-body-sm text-on-surface-variant">© 2025 GoRide Technology Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-body-sm text-on-surface-variant">
            <Link to="/terms" className="hover:text-primary transition-colors">Điều khoản &amp; Dịch vụ</Link>
            <span className="text-outline-variant">•</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">Bảo mật thông tin</Link>
            <span className="text-outline-variant">•</span>
            <Link to="/support" className="hover:text-primary transition-colors">Trung tâm hỗ trợ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
