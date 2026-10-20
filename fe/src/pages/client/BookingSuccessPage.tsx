
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  MapPin,
  CalendarDays,
  CarFront,
  UserRound,
  Printer,
  ArrowLeft,
  Info,
  ShieldCheck,
} from "lucide-react";

type BookingPayload = {
  pickup_address?: string;
  destination_address?: string;
  requested_departure_at?: string;
  seat_count?: number;
  fare_per_seat?: number;
  customer_name?: string;
  phone?: string;
  note?: string;
  trip_type?: string;
  vehicle_type?: string;
};

type BookingSuccessState = {
  booking?: BookingPayload;
  estimated_total?: number;
  vehicle_name?: string;
  booking_code?: string;
  payment_method?: string;
  promo_code?: string;
  status?: string;
};

const formatCurrency = (amount?: number) => {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "0 ₫";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "Chưa có thông tin";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state ?? {}) as BookingSuccessState;

  const {
    booking,
    estimated_total,
    vehicle_name,
    booking_code,
    payment_method,
    promo_code,
    status,
  } = state;

  // Nếu người dùng truy cập trực tiếp mà không có dữ liệu đặt xe
  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <Info className="mx-auto mb-4 h-12 w-12 text-amber-500" />

          <h1 className="text-2xl font-bold text-slate-800">
            Không tìm thấy thông tin đặt xe
          </h1>

          <p className="mt-3 text-slate-500">
            Vui lòng thực hiện đặt xe trước khi xem trang xác nhận.
          </p>

          <button
            type="button"
            onClick={() => navigate("/booking")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={18} />
            Quay lại đặt xe
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleBackToBooking = () => {
    navigate("/booking");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Success header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Đặt xe thành công!
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Cảm ơn bạn đã sử dụng dịch vụ. Thông tin đặt xe của bạn đã được ghi
            nhận trên giao diện.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <CheckCircle size={16} />
            {status === "pending"
              ? "Đang chờ xác nhận"
              : "Đã ghi nhận yêu cầu"}
          </div>
        </div>

        {/* Booking information card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Booking code */}
          <div className="border-b border-slate-200 bg-blue-50 px-6 py-5 md:px-8">
            <p className="text-sm text-slate-500">Mã đặt xe</p>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="text-2xl font-bold tracking-wide text-blue-700">
                {booking_code || "Đang cập nhật"}
              </p>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Printer size={16} />
                In thông tin
              </button>
            </div>
          </div>

          <div className="space-y-7 p-6 md:p-8">
            {/* Route information */}
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <MapPin className="text-blue-600" size={21} />
                Thông tin hành trình
              </h2>

              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <MapPin size={18} className="text-green-700" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Điểm đón</p>
                    <p className="mt-1 break-words font-semibold text-slate-800">
                      {booking.pickup_address || "Chưa có thông tin"}
                    </p>
                  </div>
                </div>

                <div className="ml-4 h-5 border-l-2 border-dashed border-slate-300" />

                <div className="flex gap-3">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <MapPin size={18} className="text-red-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Điểm đến</p>
                    <p className="mt-1 break-words font-semibold text-slate-800">
                      {booking.destination_address || "Chưa có thông tin"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <CalendarDays
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-sm text-slate-500">
                      Thời gian khởi hành
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatDate(booking.requested_departure_at)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-200" />

            {/* Vehicle information */}
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <CarFront className="text-blue-600" size={21} />
                Thông tin phương tiện
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Loại xe</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {vehicle_name ||
                      booking.vehicle_type ||
                      "Chưa có thông tin"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Số chỗ đặt</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {booking.seat_count ?? 1} chỗ
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                  <p className="text-sm text-slate-500">Loại chuyến</p>
                  <p className="mt-1 font-semibold capitalize text-slate-800">
                    {booking.trip_type || "Chưa có thông tin"}
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-200" />

            {/* Customer information */}
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <UserRound className="text-blue-600" size={21} />
                Thông tin khách hàng
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Họ và tên</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {booking.customer_name || "Chưa có thông tin"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Số điện thoại</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {booking.phone || "Chưa có thông tin"}
                  </p>
                </div>

                {booking.note && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-slate-500">Ghi chú</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-800">
                      {booking.note}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <div className="border-t border-slate-200" />

            {/* Payment information */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Chi phí và thanh toán
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Giá mỗi chỗ</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(booking.fare_per_seat)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Số chỗ</span>
                  <span className="font-medium text-slate-800">
                    {booking.seat_count ?? 1}
                  </span>
                </div>

                {promo_code && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Mã ưu đãi</span>
                    <span className="rounded-md bg-green-50 px-2 py-1 font-semibold text-green-700">
                      {promo_code}
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-slate-300 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-700">
                      Tổng chi phí dự kiến
                    </span>
                    <span className="text-2xl font-bold text-blue-700">
                      {formatCurrency(estimated_total)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-slate-500">Phương thức thanh toán</span>
                  <span className="text-right font-medium text-slate-800">
                    {payment_method || "Chưa chọn"}
                  </span>
                </div>
              </div>
            </section>

            {/* Notice */}
            <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="font-semibold text-blue-900">
                  Lưu ý về xác nhận đặt xe
                </p>
                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Đây là trang xác nhận phía giao diện. Nếu ứng dụng chưa kết
                  nối backend, mã đặt xe và trạng thái chưa được lưu hoặc xác
                  nhận trên máy chủ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleBackToBooking}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Quay lại đặt xe
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
