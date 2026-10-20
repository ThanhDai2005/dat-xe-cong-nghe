import { Navigate } from "react-router-dom";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminFaresPage from "@/pages/admin/AdminFaresPage";
import AdminTripsPage from "@/pages/admin/AdminTripsPage";

const adminRoute = {
  path: "/admin",
  children: [
    { path: "login", element: <AdminLoginPage /> },
    { element: <AdminLayout />, children: [
      { index: true, element: <Navigate to="trips" replace /> },
      { path: "fares", element: <AdminFaresPage /> },
      { path: "trips", element: <AdminTripsPage /> },
    ] },
  ],
};

export default adminRoute;
