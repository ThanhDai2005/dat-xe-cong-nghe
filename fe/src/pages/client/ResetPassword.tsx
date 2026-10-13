import { ResetPasswordForm } from "@/components/auth/reset-password-form";

const ResetPassword = () => {
  return (
    <div className="min-h-svh bg-surface flex flex-col justify-center items-center py-9 px-4 md:px-6">
      <ResetPasswordForm className="w-full" />
    </div>
  );
};

export default ResetPassword;
