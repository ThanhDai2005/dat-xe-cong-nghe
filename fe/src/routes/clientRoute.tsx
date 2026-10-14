import ClientLayout from "@/components/client/ClientLayout";
import HomePage from "@/pages/client/HomePage";
import RegisterPage from "@/pages/client/RegisterPage";
import LoginPage from "@/pages/client/LoginPage";
import VerifyOtp from "@/pages/client/VerifyOtp";
import ForgotPassword from "@/pages/client/ForgotPassword";
import VerifyPasswordOtp from "@/pages/client/VerifyPasswordOTP";
import ResetPassword from "@/pages/client/ResetPassword";
import ProfilePage from "@/pages/client/ProfilePage";

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
        {
          path: "profile",
          element: <ProfilePage />,
        },
      ],
    },
  ],
};

export default clientRoute;
