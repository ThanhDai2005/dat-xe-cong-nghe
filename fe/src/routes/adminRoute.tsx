import { Navigate } from "react-router-dom";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminTripsPage from "@/pages/admin/AdminTripsPage";
import AdminFaresPage from "@/pages/admin/AdminFaresPage";
import AdminVehiclesPage from "@/pages/admin/AdminVehiclesPage";
import AdminRoutesPage from "@/pages/admin/AdminRoutesPage";
import AdminBookingTypesPage from "@/pages/admin/AdminBookingTypesPage";
import AdminBookingsPage from "@/pages/admin/AdminBookingsPage";
import AdminPaymentsPage from "@/pages/admin/AdminPaymentsPage";
import AdminCancellationsPage from "@/pages/admin/AdminCancellationsPage";

const adminRoute = {
  path: "/admin",
  children: [
    { path: "login", element: <AdminLoginPage /> },
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <AdminDashboardPage /> },
        { path: "trips", element: <AdminTripsPage /> },
        { path: "fares", element: <AdminFaresPage /> },
        { path: "vehicles", element: <AdminVehiclesPage /> },
        { path: "routes", element: <AdminRoutesPage /> },
        { path: "booking-types", element: <AdminBookingTypesPage /> },
        { path: "bookings", element: <AdminBookingsPage /> },
        { path: "payments", element: <AdminPaymentsPage /> },
        { path: "cancellations", element: <AdminCancellationsPage /> },
      ],
    },
  ],
};

export default adminRoute;
