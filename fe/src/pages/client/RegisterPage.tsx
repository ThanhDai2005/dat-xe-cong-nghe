import { RegisterForm } from "@/components/auth/register-form";
export default function RegisterPage() {
  return (
    <div className="min-h-svh bg-background flex flex-col justify-center items-center py-9 px-5 md:px-6">
      <RegisterForm className="w-full" />
    </div>
  );
}
