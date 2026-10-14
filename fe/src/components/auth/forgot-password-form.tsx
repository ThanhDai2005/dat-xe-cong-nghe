import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { cn } from "cn";
import { toast } from "sonner";
import { forgotPassword } from "@/services/auth.service";

type Channel = "sms" | "email";

export function ForgotPasswordForm({ className }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel>("email");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ identifier, channel });
      setSent(true);
      toast.success("Đã gửi yêu cầu khôi phục!");
      navigate("/verify-password-otp", { state: { identifier, channel } });
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Gửi yêu cầu thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="w-full max-w-6xl mx-auto my-auto">
        {/* Main card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl bg-surface-container-lowest">
          {/* ── LEFT PANEL ── */}
          <div
            className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between text-on-primary relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #094099 0%, #0050c8 55%, #1d68f2 100%)",
            }}
          >
            {/* Ambient blobs */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-28 -right-24 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />

            {/* Top badges */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md">
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">
                  shield_lock
                </span>
                <span className="text-label-sm tracking-wider uppercase text-white font-semibold">
                  Bảo mật cấp cao
                </span>
              </div>
              <span className="text-label-sm text-white/70">
                GoRide Security Shield
              </span>
            </div>

            {/* Center illustration */}
            <div className="relative z-10 flex flex-col items-center text-center my-8 md:my-12">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full bg-white/10 blur-xl scale-95 animate-pulse" />
                <img
                  src="https://lh3.googleusercontent.com/aida/AEtjO1VYFtcRMSFiFobsm9tJktuKA0MHV9-e6g3H_0PyeDtShwqlgo8tqEBTt_N3uqz89KX0MPNz74lToOONWyvC0Chjo7lAy2q0289fACEgAzrMOgs5mG0rmNKXXUPqKrfQ4IDitJg9DRZBnjkFhQgTMn5wjUqF899jbbuEYnE3aMpwGshng9gyAhA3AHUGp__GUDnhoRCxRfAnSARnIxVHkHnTNWDzjMyrZDkk5_B3-RF95TJapiZk-qPsGQ"
                  alt="Minh họa bảo mật khôi phục mật khẩu GoRide"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_16px_32px_rgba(0,0,0,0.25)]"
                />
              </div>
              <h2 className="text-headline-md font-bold text-white mb-3 tracking-tight">
                Khôi phục mật khẩu an toàn &amp; nhanh chóng
              </h2>
              <p className="text-body-md text-white/80 max-w-sm">
                Bảo vệ quyền truy cập tài khoản và lịch trình di chuyển thông
                minh của bạn trên mọi hành trình đô thị.
              </p>
            </div>

            {/* Bottom ISO badge */}
            <div className="relative z-10">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-tertiary-fixed text-[24px]">
                    verified_user
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-label-md font-semibold text-white">
                    Chứng nhận chuẩn ISO/IEC 27001
                  </span>
                  <span className="text-body-sm text-white/70">
                    Mã hóa đầu cuối &amp; bảo vệ danh tính 2 lớp
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between bg-surface-container-lowest">
            <div>
              {/* Top nav */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-label-md text-on-surface-variant hover:text-primary transition-colors group"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                    arrow_back
                  </span>
                  <span>Quay lại đăng nhập</span>
                </Link>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-label-sm text-on-surface-variant font-medium">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  Cổng khôi phục tự động
                </span>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-headline-lg font-bold text-on-surface tracking-tight mb-2">
                  Quên mật khẩu?
                </h1>
                <p className="text-body-md text-on-surface-variant">
                  Nhập email hoặc số điện thoại đã đăng ký để bắt đầu quy trình
                  cấp lại mã xác thực bảo mật.
                </p>
              </div>

              {/* Success alert */}
              {sent && (
                <div className="mb-6 p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-tertiary">
                    check_circle
                  </span>
                  <div>
                    <p className="text-label-lg font-semibold text-on-tertiary-fixed">
                      Yêu cầu đã được tiếp nhận!
                    </p>
                    <p className="text-body-sm mt-0.5 text-on-tertiary-fixed">
                      Nếu tài khoản tồn tại, GoRide đã gửi mã OTP. Vui lòng kiểm
                      tra hộp thư hoặc tin nhắn SMS.
                    </p>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Channel selector */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-label-md text-on-surface font-semibold">
                      Kênh nhận mã xác thực (OTP)
                    </label>
                    <span className="text-label-sm text-on-surface-variant hidden sm:inline">
                      API: &#123; identifier, channel &#125;
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* SMS */}
                    <button
                      type="button"
                      onClick={() => setChannel("sms")}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl transition-all text-left focus:outline-none",
                        channel === "sms"
                          ? "bg-primary-fixed text-on-primary-fixed"
                          : "bg-surface-container text-on-surface",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center",
                            channel === "sms"
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-highest text-on-surface-variant",
                          )}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            sms
                          </span>
                        </div>
                        <div>
                          <p className="text-label-md font-semibold">
                            Tin nhắn SMS
                          </p>
                          <p className="text-body-sm text-on-surface-variant">
                            (+84) Số di động
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center",
                          channel === "sms"
                            ? "bg-primary"
                            : "bg-surface-container-highest",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            channel === "sms" ? "bg-white" : "bg-transparent",
                          )}
                        />
                      </div>
                    </button>
                    {/* Email */}
                    <button
                      type="button"
                      onClick={() => setChannel("email")}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl transition-all text-left focus:outline-none",
                        channel === "email"
                          ? "bg-primary-fixed text-on-primary-fixed"
                          : "bg-surface-container text-on-surface",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center",
                            channel === "email"
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-highest text-on-surface-variant",
                          )}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            mail
                          </span>
                        </div>
                        <div>
                          <p className="text-label-md font-semibold">
                            Thư điện tử
                          </p>
                          <p className="text-body-sm text-on-surface-variant">
                            Email cá nhân
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center",
                          channel === "email"
                            ? "bg-primary"
                            : "bg-surface-container-highest",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            channel === "email" ? "bg-white" : "bg-transparent",
                          )}
                        />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Identifier input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      className="text-label-md text-on-surface font-semibold"
                      htmlFor="identifierInput"
                    >
                      Email hoặc số điện thoại{" "}
                      <span className="text-error">*</span>
                    </label>
                    <span className="text-label-sm text-on-surface-variant">
                      {channel === "email"
                        ? "Ví dụ: nguyenvana@gmail.com"
                        : "Định dạng số điện thoại Việt Nam"}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">
                        {channel === "email" ? "mail" : "phone_iphone"}
                      </span>
                    </div>
                    <input
                      id="identifierInput"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        channel === "email"
                          ? "Nhập email hoặc số điện thoại đã đăng ký"
                          : "Ví dụ: 0912 345 678 hoặc +84912345678"
                      }
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-outline text-body-md focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-label-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.99] disabled:opacity-60"
                >
                  <span>
                    {loading
                      ? "Đang xử lý yêu cầu..."
                      : "Gửi yêu cầu khôi phục"}
                  </span>
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-on-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8v8H4z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Page footer */}
      <footer className="w-full py-6 px-4 md:px-6 bg-surface-container-low mt-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <span className="text-body-sm text-on-surface-variant">
            © 2025 GoRide Technology Platform. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-body-sm">
            <a
              href="#"
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Điều khoản &amp; Dịch vụ
            </a>
            <span className="text-outline-variant">•</span>
            <a
              href="#"
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Bảo mật thông tin
            </a>
            <span className="text-outline-variant">•</span>
            <a
              href="#"
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Trung tâm hỗ trợ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
