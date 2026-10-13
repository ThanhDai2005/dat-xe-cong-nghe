import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

const ForgotPassword = () => {
  return (
    <div className="min-h-svh bg-surface flex flex-col justify-center items-center px-4 md:px-6 py-9">
      <ForgotPasswordForm className="w-full" />
    </div>
  );
};

export default ForgotPassword;
