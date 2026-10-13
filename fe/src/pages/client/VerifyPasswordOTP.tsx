import { Navigate, useLocation, useNavigate } from "react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpVerifyForm } from "@/components/auth/OtpVerifyForm";
import { authService, type RecoveryChannel } from "@/services/authService";
import { maskIdentifier } from "@/lib/auth-utils";

const VerifyPasswordOtp = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const identifier: string | undefined = state?.identifier;
  const channel: RecoveryChannel = state?.channel ?? "email";

  if (!identifier) return <Navigate to="/forgot-password" replace />;

  return (
    <AuthShell
      badge="Bảo mật cấp cao"
      title="Xác thực bảo vệ tài khoản"
      description="Nhập mã OTP để xác minh bạn là chủ sở hữu hợp pháp của tài khoản."
      icon={ShieldCheck}
      footerIcon={Lock}
      footerTitle="Bảo mật mã hóa đa tầng"
      footerDesc="Đường truyền TLS 1.3"
    >
      <OtpVerifyForm
        stepLabel="Bước 02 / 03: Xác thực bảo mật"
        title="Xác thực yêu cầu khôi phục"
        channelLabel={channel === "sms" ? "SMS" : "email"}
        maskedTarget={maskIdentifier(identifier)}
        backTo="/forgot-password"
        backLabel="Quay lại nhập thông tin"
        submitLabel="Xác nhận mã"
        onVerify={async (otp) => {
          const { resetToken } = await authService.verifyResetOtp(identifier, otp);
          navigate("/reset-password", { state: { resetToken }, replace: true });
        }}
        onResend={() => authService.forgotPassword(identifier, channel)}
      />
    </AuthShell>
  );
};

export default VerifyPasswordOtp;
