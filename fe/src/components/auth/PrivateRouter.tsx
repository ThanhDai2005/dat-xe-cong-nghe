import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
export default function PrivateRouter() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p>Đang kiểm tra đăng nhập…</p>;
  return isAuthenticated ? <Outlet /> : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
}
