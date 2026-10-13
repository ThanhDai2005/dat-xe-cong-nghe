import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { ArrowRight, Mail, Sparkles, UserRound, Zap } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthAlert, AuthInput, FieldLabel, PrimaryButton } from "@/components/auth/AuthField";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/http";
import { isEmail } from "@/lib/auth-utils";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { accessToken, user, updateUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!accessToken) return <Navigate to="/login" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return setError("Vui lòng nhập họ và tên.");
    if (email && !isEmail(email)) return setError("Email không đúng định dạng.");
    if (!agree) return setError("Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
    setError("");
    setLoading(true);
    try {
      const updated = await authService.updateProfile(accessToken, {
        fullName: fullName.trim(),
        email: email.trim() || undefined,
      });
      updateUser(updated);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể lưu hồ sơ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Nền tảng di chuyển thông minh"
      title="Bắt đầu hành trình của bạn cùng GoRide ngay hôm nay."
      description="Chỉ còn một bước để hoàn tất tài khoản và đặt chuyến đầu tiên."
      icon={Sparkles}
      footerIcon={Zap}
      footerTitle="Kết nối tài xế siêu tốc"
      footerDesc="Tài xế gần bạn nhất sẵn sàng nhận chuyến"
    >
      <div className="mb-6">
        <h1 className="text-[2rem] leading-tight font-bold tracking-tight mb-1">Hoàn tất hồ sơ cá nhân</h1>
        <p className="text-[15px] text-[#424655]">Đăng ký để thuận tiện quản lý chuyến đi của bạn.</p>
      </div>
      {error && <AuthAlert variant="error" title="Vui lòng kiểm tra lại thông tin">{error}</AuthAlert>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <FieldLabel htmlFor="fullName" required>Họ và tên</FieldLabel>
          <AuthInput id="fullName" icon={UserRound} value={fullName} autoComplete="name"
            onChange={(e) => setFullName(e.target.value)} placeholder="Nhập họ và tên (ví dụ: Nguyễn Văn A)" />
        </div>
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <AuthInput id="email" type="email" icon={Mail} value={email} autoComplete="email"
            onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email của bạn (ví dụ: ten@domain.com)" />
        </div>
        <label className="flex items-start gap-2 cursor-pointer select-none text-[13px] text-[#424655]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded accent-[#0050c8] cursor-pointer" />
          <span>
            Tôi đồng ý với <a href="/terms" className="font-semibold text-[#0050c8] hover:underline">Điều khoản dịch vụ</a> và{" "}
            <a href="/privacy" className="font-semibold text-[#0050c8] hover:underline">Chính sách bảo mật</a> của GoRide{" "}
            <span className="text-[#ba1a1a] font-bold">*</span>
          </span>
        </label>
        <PrimaryButton type="submit" loading={loading} loadingText="Đang lưu hồ sơ...">
          Hoàn tất & Bắt đầu đặt chuyến <ArrowRight className="w-[18px] h-[18px]" />
        </PrimaryButton>
      </form>
    </AuthShell>
  );
};

export default CompleteProfile;
