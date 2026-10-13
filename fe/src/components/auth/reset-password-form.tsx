import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { cn } from "cn";
import { toast } from "sonner";
import { resetPassword } from "@/services/auth.service";

type StrengthResult = { score: 0|1|2|3; label: string; labelColor: string; barColor: string };

function evaluateStrength(val: string): StrengthResult {
  if (!val) return { score: 0, label: "Chưa nhập", labelColor: "text-outline", barColor: "" };
  let s = 0;
  if (val.length >= 8) s++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) s++;
  if (/\d/.test(val) || /[^A-Za-z0-9]/.test(val)) s++;
  if (s === 1) return { score: 1, label: "Yếu",      labelColor: "text-error",     barColor: "bg-error" };
  if (s === 2) return { score: 2, label: "Trung bình",labelColor: "text-secondary", barColor: "bg-secondary" };
  return         { score: 3, label: "Mạnh",      labelColor: "text-tertiary",  barColor: "bg-tertiary" };
}

export function ResetPasswordForm({ className }: React.ComponentProps<"div">) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { resetToken = "", identifier = "" } =
    (location.state as { resetToken?: string; identifier?: string }) || {};

  const [newPw,  setNewPw]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1,   setShow1]   = useState(false);
  const [show2,   setShow2]   = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = evaluateStrength(newPw);
  const matchOk  = confirm.length > 0 && newPw === confirm && newPw.length >= 8;
  const mismatch = confirm.length > 0 && newPw !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirm) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    if (strength.score < 2) { toast.error("Mật khẩu còn quá yếu"); return; }
    setLoading(true);
    try {
      await resetPassword({ resetToken, newPassword: newPw, confirmNewPassword: confirm });
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Đặt lại mật khẩu thất bại");
    } finally { setLoading(false); }
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="w-full max-w-6xl mx-auto py-2 md:py-4">
        <div className="w-full rounded-2xl bg-surface-container-lowest shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">

          {/* ── LEFT PANEL ── */}
          <div className="lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-[#094099] via-primary to-primary-container text-on-primary p-9 flex flex-col justify-between">
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />

            {/* Top badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 backdrop-blur-md">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">verified_user</span>
                <span className="text-label-sm uppercase tracking-wider text-white">GoRide Identity Security</span>
              </div>
              <span className="text-label-sm text-white/70">Bảo mật đa lớp</span>
            </div>

            {/* Center Visual */}
            <div className="relative z-10 my-9 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute inset-2 rounded-full bg-white/10 animate-pulse" />
                <div className="absolute inset-8 rounded-full bg-white/15 backdrop-blur-sm" />
                {/* Shield graphic */}
                <div className="relative w-44 h-52 rounded-[2.5rem] bg-gradient-to-b from-white/25 to-white/5 backdrop-blur-lg flex flex-col items-center justify-center shadow-2xl p-4">
                  <div className="w-20 h-20 rounded-full bg-white text-primary flex items-center justify-center shadow-lg relative">
                    <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-label-sm uppercase tracking-wider text-white/90">Chuẩn mã hóa</span>
                    <p className="text-headline-sm leading-tight text-white mt-1">AES-256 Bit</p>
                  </div>
                </div>
                {/* Floating chip left */}
                <div className="absolute -left-3 top-10 px-2 py-2 rounded-xl bg-white text-on-surface shadow-xl flex items-center gap-1 hover:scale-105 transition-transform">
                  <div className="w-7 h-7 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">key</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-on-surface-variant leading-none">Khôi phục mật khẩu</span>
                    <span className="text-label-md leading-tight text-on-surface font-semibold">Mã OTP 6 số</span>
                  </div>
                </div>
                {/* Floating chip right */}
                <div className="absolute -right-3 bottom-10 px-2 py-2 rounded-xl bg-white text-on-surface shadow-xl flex items-center gap-1 hover:scale-105 transition-transform">
                  <div className="w-7 h-7 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-on-surface-variant leading-none">Xác thực 2 lớp</span>
                    <span className="text-label-md leading-tight text-tertiary font-bold">BẢO MẬT ISO/IEC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom copy */}
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <h1 className="text-headline-lg text-white">Thiết lập mật khẩu mới</h1>
                <p className="text-body-md text-white/80">
                  Tạo mật khẩu mạnh để bảo vệ tài khoản và sẵn sàng cho những chuyến đi tiếp theo cùng GoRide.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-white/90">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/15 backdrop-blur-sm text-label-md">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">shield_lock</span>
                  <span>Đạt tiêu chuẩn PCI DSS &amp; ISO 27001</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-7 p-6 md:p-9 lg:p-14 flex flex-col justify-between bg-surface-container-lowest">
            <div className="w-full max-w-lg mx-auto flex flex-col justify-center flex-1">

              {/* Heading group */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-tertiary/10 text-tertiary text-label-md mb-4">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Đã xác thực OTP hợp lệ cho tài khoản {identifier || "+84 912 ••• 678"}</span>
                </div>
                <h2 className="text-headline-lg text-on-surface">Tạo mật khẩu mới</h2>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Hãy chọn mật khẩu mới để tiếp tục sử dụng tài khoản GoRide.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-label-lg text-on-surface" htmlFor="new-password">
                      Mật khẩu mới <span className="text-error">*</span>
                    </label>
                    {newPw && (
                      <span className={cn("text-label-md", strength.labelColor)}>{strength.label}</span>
                    )}
                  </div>
                  <div className="relative rounded-xl bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-[20px]">lock</span>
                    </div>
                    <input
                      id="new-password"
                      type={show1 ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Nhập tối thiểu 8 ký tự..."
                      required
                      className="w-full pl-11 pr-12 py-3.5 bg-transparent rounded-xl text-on-surface placeholder:text-outline focus:outline-none text-body-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShow1(!show1)}
                      aria-label="Ẩn hiện mật khẩu"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface focus:outline-none transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {show1 ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {/* Strength bars (3 segments) */}
                  <div className="pt-1.5 space-y-1">
                    <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                      {[1, 2, 3].map((bar) => (
                        <div
                          key={bar}
                          className={cn(
                            "h-full rounded-full transition-colors duration-300",
                            strength.score >= bar ? strength.barColor : "bg-surface-container-high"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-body-sm text-on-surface-variant flex items-center gap-1 pt-1">
                      <span className="material-symbols-outlined text-[15px] text-outline">info</span>
                      <span>Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số.</span>
                    </p>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-label-lg text-on-surface" htmlFor="confirm-password">
                    Xác nhận mật khẩu mới <span className="text-error">*</span>
                  </label>
                  <div className="relative rounded-xl bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-[20px]">enhanced_encryption</span>
                    </div>
                    <input
                      id="confirm-password"
                      type={show2 ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      required
                      className="w-full pl-11 pr-12 py-3.5 bg-transparent rounded-xl text-on-surface placeholder:text-outline focus:outline-none text-body-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShow2(!show2)}
                      aria-label="Ẩn hiện xác nhận mật khẩu"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface focus:outline-none transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {show2 ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {/* Match indicator */}
                  {matchOk && (
                    <p className="pt-1 flex items-center gap-1 text-body-sm text-tertiary">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Mật khẩu trùng khớp chính xác
                    </p>
                  )}
                  {mismatch && (
                    <p className="pt-1 flex items-center gap-1 text-body-sm text-error">
                      <span className="material-symbols-outlined text-[15px]">cancel</span>
                      Mật khẩu xác nhận không khớp
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-2 space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>Đặt lại mật khẩu</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                  <div className="text-center">
                    <Link
                      to="/login"
                      className="text-label-md text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">keyboard_backspace</span>
                      <span>&nbsp;Quay lại đăng nhập</span>
                    </Link>
                  </div>
                </div>
              </form>
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
