import { VerifyPasswordOtpForm } from "@/components/auth/verify-password-otp-form";

const VerifyPasswordOTP = () => {
  return (
    <div className="min-h-svh bg-surface flex flex-col justify-center items-center py-9 px-4 md:px-6">
      <VerifyPasswordOtpForm className="w-full" />
    </div>
  );
};

export default VerifyPasswordOTP;
