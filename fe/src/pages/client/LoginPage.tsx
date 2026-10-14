import { LoginForm } from "@/components/auth/login-form";
export default function LoginPage() {
  return (
    <div className="min-h-svh bg-surface flex flex-col justify-center items-center py-9 px-4 md:px-6 relative">
      <LoginForm className="w-full" />
    </div>
  );
}
