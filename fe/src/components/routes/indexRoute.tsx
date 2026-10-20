
import { createBrowserRouter, Navigate } from "react-router-dom";

import BookingPage from "@/pages/client/BookingPage";
import BookingConfirmPage from "@/pages/client/BookingConfirmPage";
import BookingSuccessPage from "@/pages/client/BookingSuccessPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/booking" replace />,
  },
  {
    path: "/booking",
    element: <BookingPage />,
  },
  {
    path: "/booking/confirm",
    element: <BookingConfirmPage />,
  },
  {
    path: "/booking/success",
    element: <BookingSuccessPage />,
  },
  {
    path: "*",
    element: (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6">
        <h1 className="text-3xl font-bold text-slate-900">
          404 - Không tìm thấy trang
        </h1>

        <p className="text-center text-slate-600">
          Đường dẫn bạn truy cập không tồn tại.
        </p>

        <a
          href="/booking"
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Quay lại trang đặt xe
        </a>
      </div>
    ),
  },
]);

export default router;
