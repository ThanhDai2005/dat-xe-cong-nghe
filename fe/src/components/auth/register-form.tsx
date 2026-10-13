import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { cn } from "cn";
import { toast } from "sonner";
import { register } from "@/services/auth.service";

export function RegisterForm({ className }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [agreed,  setAgreed]  = useState(false);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", password: "", confirmPassword: "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error("Vui lòng đồng ý với điều khoản dịch vụ"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    setLoading(true);
    try {
      await register({
        role: "CUSTOMER",
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Đăng ký thành công! Vui lòng xác thực số điện thoại.");
      navigate("/verify-otp", { state: { phone: form.phone, purpose: "register" } });
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Đăng ký thất bại, vui lòng thử lại");
    } finally { setLoading(false); }
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(64,194,253,0.18),rgba(250,248,255,0))] opacity-90" />

      <div className="w-full max-w-6xl mx-auto flex flex-col">
        {/* Main Dual-Column Card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-[0_20px_50px_-15px_rgba(19,27,46,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[760px]">

          {/* ── LEFT PANEL ── */}
          <div
            className="lg:col-span-5 p-9 lg:p-14 text-on-primary flex flex-col justify-between relative overflow-hidden"
            style={{ background: "linear-gradient(150deg, #094099 0%, #0050c8 55%, #1d68f2 100%)" }}
          >
            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-tertiary-fixed-dim/15 blur-2xl pointer-events-none" />

            {/* Top storytelling */}
            <div className="relative z-10 flex flex-col gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                  🛡️ NỀN TẢNG DI CHUYỂN THÔNG MINH
                </span>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mt-4 mb-3">
                  Bắt đầu hành trình của bạn cùng GoRide ngay hôm nay.
                </h2>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1XmIxNfivtmcnN48OfpRS4zSud4l2dluCvsDL-GE5I0qLgito8WKEnvEPxguIz3QgsxoEim_MQiv2mRn-a9wgV94hbL9d-Q1AftTaCy8-aQF2s0--tYWVov2d1UrW84bfg3VbZcd-oIMmGKamBFUfuY9rqogFDYwiCs10l0gK0BZVuk0lCLxxPIlpz3bWmrQw3laGS4POaYR5W1txdnFS9MB4L3hy_D0kyzYy8wY2NBhndB-ZtGpcKJtNo"
                alt="GoRide Connection Illustration"
                loading="lazy"
                decoding="async"
                className="w-full max-w-sm mx-auto my-6 drop-shadow-2xl"
              />
            </div>

            {/* Bottom trust */}
            <div className="relative z-10 pt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white/90 text-xs font-medium">
                ⚡ Kết nối tài xế siêu tốc trong bán kính 500m
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-7 p-9 lg:p-14 flex flex-col justify-between bg-surface-container-lowest">
            <div className="w-full max-w-xl mx-auto flex flex-col">

              {/* Form Header */}
              <div className="mb-6">
                <h1 className="text-headline-lg text-on-surface font-bold tracking-tight">
                  Tạo tài khoản GoRide
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Đăng ký để thuận tiện quản lý chuyến đi của bạn.
                </p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>


                {/* 1. Họ và tên */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md text-on-surface" htmlFor="fullName">
                    Họ và tên <span className="text-error font-bold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">person</span>
                    <input
                      id="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={set("fullName")}
                      placeholder="Nhập họ và tên (ví dụ: Nguyễn Văn A)"
                      required
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface text-body-md outline-none transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#0050c8]"
                    />
                  </div>
                </div>

                {/* 2. Số điện thoại */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md text-on-surface" htmlFor="phone">
                    Số điện thoại <span className="text-error font-bold">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {/* +84 prefix pill */}
                    <div className="h-12 px-3.5 rounded-xl bg-surface-container-high flex items-center gap-1.5 shrink-0 select-none">
                      <span className="text-body-sm text-label-md text-on-surface flex items-center gap-1">
                        🇻🇳 +84
                      </span>
                      <span className="material-symbols-outlined text-outline text-[16px]">arrow_drop_down</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="912 345 678"
                      required
                      className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md outline-none transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#0050c8]"
                    />
                  </div>
                </div>

                {/* 3. Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md text-on-surface" htmlFor="email">Email</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">mail</span>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="Nhập email của bạn (ví dụ: ten@domain.com)"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface text-body-md outline-none transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#0050c8]"
                    />
                  </div>
                </div>

                {/* 4. Mật khẩu */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md text-on-surface" htmlFor="password">
                    Mật khẩu <span className="text-error font-bold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">lock</span>
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={set("password")}
                      placeholder="Nhập mật khẩu an toàn"
                      required
                      className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-low text-on-surface text-body-md outline-none transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#0050c8]"
                    />
                    <button type="button" aria-label="Hiện mật khẩu"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 text-on-surface-variant hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-[20px]">
                        {showPw ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">info</span>
                    <span>Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số.</span>
                  </p>
                </div>

                {/* 5. Xác nhận mật khẩu */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md text-on-surface" htmlFor="confirmPassword">
                    Xác nhận mật khẩu <span className="text-error font-bold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">lock_reset</span>
                    <input
                      id="confirmPassword"
                      type={showCPw ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={set("confirmPassword")}
                      placeholder="Nhập lại mật khẩu vừa tạo"
                      required
                      className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-low text-on-surface text-body-md outline-none transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#0050c8]"
                    />
                    <button type="button" aria-label="Hiện mật khẩu xác nhận"
                      onClick={() => setShowCPw(!showCPw)}
                      className="absolute right-3 text-on-surface-variant hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-[20px]">
                        {showCPw ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 6. Terms */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    required
                    className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary cursor-pointer mt-0.5"
                  />
                  <label htmlFor="termsCheck" className="text-body-sm text-on-surface-variant cursor-pointer select-none">
                    Tôi đồng ý với{" "}
                    <Link to="/terms" className="text-primary font-semibold hover:underline">Điều khoản dịch vụ</Link>{" "}
                    và{" "}
                    <Link to="/privacy" className="text-primary font-semibold hover:underline">Chính sách bảo mật</Link>{" "}
                    của GoRide <span className="text-error font-bold">*</span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary text-on-primary text-label-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all hover:bg-primary-container active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                      </svg>
                      <span>Đang kết nối hệ thống GoRide...</span>
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Tạo tài khoản</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </span>
                  )}
                </button>
              </form>

              {/* Switch to login */}
              <div className="mt-6 text-center text-body-md text-on-surface-variant">
                Đã có tài khoản GoRide?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline ml-1 inline-flex items-center gap-0.5"
                >
                  Đăng nhập ngay
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full mt-6 px-4 pb-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
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
