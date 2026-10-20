import { useLocation } from "react-router-dom";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const location = useLocation();

  const redirectTo =
    new URLSearchParams(location.search).get("redirect") ||
    "/booking";

  // Chỉ cho phép điều hướng đến đường dẫn nội bộ
  const safeRedirect = redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
    ? redirectTo
    : "/booking";

  return (
    <div className="min-h-screen">
      <LoginForm
        className="w-full"
        redirectTo={safeRedirect}
      />
    </div>
  );
}
