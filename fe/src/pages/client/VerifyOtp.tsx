import { Navigate, useLocation, useNavigate } from "react-router";
import { ShieldCheck, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpVerifyForm } from "@/components/auth/OtpVerifyForm";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { maskPhone } from "@/lib/auth-utils";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const phone: string | undefined = state?.phone;

  if (!phone) return <Navigate to="/login" replace />;

  const onVerify = async (otp: string) => {
    const result = await authService.verifyPhoneOtp(phone, otp);
    setSession(result, true);
    navigate(result.isNewUser ? "/complete-profile" : (state?.from ?? "/"), { replace: true });
  };

  return (
    <AuthShell
      badge="Bảo mật tài khoản tối đa"
      title="Bảo mật tài khoản của bạn tuyệt đối với xác thực OTP."
      description="Mã xác thực chỉ có hiệu lực một lần và hết hạn sau ít phút."
      icon={ShieldCheck}
      footerIcon={Lock}
      footerTitle="Mã hóa 256-bit"
      footerDesc="Tiêu chuẩn bảo mật ISO/IEC 27001"
    >
      <OtpVerifyForm
        title="Xác thực mã OTP"
        channelLabel="SMS"
        maskedTarget={maskPhone(phone)}
        backTo="/login"
        backLabel="Quay lại Đăng nhập"
        submitLabel="Xác nhận & Tiếp tục"
        onVerify={onVerify}
        onResend={() => authService.sendPhoneOtp(phone)}
      />
    </AuthShell>
  );
};

export default VerifyOtp;
