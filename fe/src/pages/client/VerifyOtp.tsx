import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

const VerifyOtp = () => {
  return (
    <div className="min-h-svh bg-background flex flex-col justify-center items-center py-9 px-4 md:px-6 relative">
      <VerifyOtpForm className="w-full" />
    </div>
  );
};

export default VerifyOtp;
