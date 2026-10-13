import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, KeyRound, Mail, Smartphone, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "cn";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthAlert, AuthInput, FieldLabel, PrimaryButton } from "@/components/auth/AuthField";
import { authService, type RecoveryChannel } from "@/services/authService";
import { ApiError } from "@/lib/http";
import { isEmail, normalizeVnPhone } from "@/lib/auth-utils";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [channel, setChannel] = useState<RecoveryChannel>("email");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title: string; text: string } | null>(null);

  const option = (c: RecoveryChannel, label: string, sub: string, Icon: typeof Mail) => {
    const active = channel === c;
    return (
      <button type="button" onClick={() => { setChannel(c); setValue(""); setError(null); }}
        className={cn("flex items-center justify-between p-3.5 rounded-xl text-left transition-all cursor-pointer",
          active ? "bg-[#dae2ff] text-[#001848]" : "bg-[#eaedff] text-[#131b2e]")}>
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center",
            active ? "bg-[#0050c8] text-white" : "bg-[#dae2fd] text-[#424655]")}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-semibold">{label}</p>
            <p className="text-[12px] text-[#424655]">{sub}</p>
          </div>
        </div>
        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", active ? "bg-[#0050c8]" : "bg-[#dae2fd]")}>
          {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </button>
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = channel === "sms" ? normalizeVnPhone(value) : value.trim();
    if (!identifier || (channel === "email" && !isEmail(identifier))) {
      return setError({
        title: "Thông tin chưa hợp lệ",
        text: channel === "sms" ? "Vui lòng nhập số điện thoại di động hợp lệ." : "Vui lòng nhập địa chỉ email hợp lệ.",
      });
    }
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(identifier, channel);
      navigate("/verify-password-otp", { state: { identifier, channel } });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError({ title: "Yêu cầu vượt quá giới hạn an toàn", text: "Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng đợi ít phút trước khi thử lại." });
      } else {
        setError({ title: "Không thể gửi yêu cầu", text: err instanceof ApiError ? err.message : "Vui lòng thử lại." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Bảo mật cấp cao"
      title="Khôi phục mật khẩu an toàn & nhanh chóng"
      description="Bảo vệ quyền truy cập tài khoản và lịch trình di chuyển thông minh của bạn."
      icon={KeyRound}
      footerIcon={ShieldCheck}
      footerTitle="Chứng nhận chuẩn ISO/IEC 27001"
      footerDesc="Mã hóa đầu cuối & bảo vệ danh tính 2 lớp"
    >
      <Link to="/login" className="inline-flex items-center gap-2 mb-6 text-[13px] font-semibold text-[#424655] hover:text-[#0050c8]">
        <ArrowLeft className="w-[18px] h-[18px]" /> Quay lại đăng nhập
      </Link>
      <div className="mb-6">
        <h1 className="text-[2rem] leading-tight font-bold tracking-tight mb-1">Quên mật khẩu?</h1>
        <p className="text-[15px] text-[#424655]">Nhập email hoặc số điện thoại đã đăng ký để bắt đầu quy trình cấp lại mã xác thực bảo mật.</p>
      </div>
      {error && <AuthAlert variant="error" title={error.title}>{error.text}</AuthAlert>}
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <p className="mb-2.5 text-[13px] font-semibold">Kênh nhận mã xác thực (OTP)</p>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Phương thức xác thực">
            {option("sms", "Tin nhắn SMS", "(+84) Số di động", MessageSquare)}
            {option("email", "Thư điện tử", "Email cá nhân", Mail)}
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="identifier" required>Email hoặc số điện thoại</FieldLabel>
          <AuthInput id="identifier" icon={channel === "sms" ? Smartphone : Mail}
            type={channel === "sms" ? "tel" : "email"} value={value} onChange={(e) => setValue(e.target.value)}
            placeholder={channel === "sms" ? "Ví dụ: 0912 345 678 hoặc +84912345678" : "Nhập địa chỉ email đăng ký (ví dụ: ten@domain.com)"} />
        </div>
        <PrimaryButton type="submit" loading={loading} loadingText="Đang xử lý yêu cầu...">
          Gửi yêu cầu khôi phục <ArrowRight className="w-5 h-5" />
        </PrimaryButton>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;
