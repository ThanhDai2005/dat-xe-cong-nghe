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
import { LiveBookingPage, LiveBookingConfirmPage, LiveTripsPage, LiveTripDetailPage } from "@/pages/client/LiveBooking";

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
        { path: "services", element: <ServicePage /> },
        { path: "fares", element: <FarePage /> },
        { path: "support", element: <SupportPage /> },
        {
          element: <PrivateRouter />,
          children: [
            { path: "booking", element: <LiveBookingPage /> },
            { path: "booking/confirm", element: <LiveBookingConfirmPage /> },
            { path: "booking/success/:tripId", element: <LiveTripDetailPage /> },
            {
              path: "profile",
              element: <ProfilePage />,
            },
            { path: "trips", element: <LiveTripsPage /> },
            { path: "trip/:tripId", element: <LiveTripDetailPage /> },
          ],
        },
      ],
    },
  ],
};

export default clientRoute;
