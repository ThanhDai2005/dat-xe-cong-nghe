import ClientLayout from "@/components/client/ClientLayout";
import HomePage from "@/pages/client/HomePage";
import RegisterPage from "@/pages/client/RegisterPage";
import LoginPage from "@/pages/client/LoginPage";
import VerifyOtp from "@/pages/client/VerifyOtp";
import ForgotPassword from "@/pages/client/ForgotPassword";
import VerifyPasswordOtp from "@/pages/client/VerifyPasswordOTP";
import ResetPassword from "@/pages/client/ResetPassword";
import PrivateRouter from "@/components/auth/PrivateRouter";
import ServicePage from "@/pages/client/ServicePage";
import FarePage from "@/pages/client/FarePage";
import SupportPage from "@/pages/client/SupportPage";
import ProfilePage from "@/pages/client/ProfilePage";
import TripPage from "@/pages/client/TripPage";
import BookingPage from "@/pages/client/BookingPage";
import TripDetailPage from "@/pages/client/TripDetailPage";
import BookingConfirmPage from "@/pages/client/BookingConfirmPage";

const clientRoute = {
  path: "/",
  children: [
    {
      path: "register",
      element: <RegisterPage />,
    },
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "verify-otp",
      element: <VerifyOtp />,
    },
    {
      path: "forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "verify-password-otp",
      element: <VerifyPasswordOtp />,
    },
    {
      path: "reset-password",
      element: <ResetPassword />,
    },
    {
      element: <ClientLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        { path: "booking", element: <BookingPage /> },
        { path: "booking/confirm", element: <BookingConfirmPage /> },
        { path: "services", element: <ServicePage /> },
        { path: "fares", element: <FarePage /> },
        { path: "support", element: <SupportPage /> },
        {
          element: <PrivateRouter />,
          children: [
            {
              path: "profile",
              element: <ProfilePage />,
            },
            { path: "trips", element: <TripPage /> },
            { path: "trip/:tripId", element: <TripDetailPage /> },
          ],
        },
      ],
    },
  ],
};

export default clientRoute;
