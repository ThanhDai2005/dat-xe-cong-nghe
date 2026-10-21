import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "@/services/auth.service";

const PrivateRouter = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default PrivateRouter;