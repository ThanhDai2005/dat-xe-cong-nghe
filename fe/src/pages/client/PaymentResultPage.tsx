import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { isAuthenticated } from "@/services/auth.service";
import {
  bookingApi, bookingErrorMessage, bookingErrorStatus, formatDeparture, formatFare, type BookingDetail,
} from "@/services/booking.service";

export default function PaymentResultPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [holdExpired, setHoldExpired] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    if (!isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent(`/booking/result/${bookingId}`)}`, { replace: true });
      return;
    }
    let active = true;
    let expiryTimer: number | undefined;
    bookingApi.booking(bookingId)
      .then((data) => {
        if (!active) return;
        setBooking(data);
        if (data.paymentStatus === "PENDING") {
          const remaining = new Date(data.expiresAt).getTime() - Date.now();
          setHoldExpired(remaining <= 0);
          if (remaining > 0) expiryTimer = window.setTimeout(() => setHoldExpired(true), remaining);
        }
      })
      .catch((cause) => {
        if (!active) return;
        if (bookingErrorStatus(cause) === 401) {
          navigate(`/login?redirect=${encodeURIComponent(`/booking/result/${bookingId}`)}`, { replace: true });
        } else setError(bookingErrorMessage(cause));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; if (expiryTimer) window.clearTimeout(expiryTimer); };
  }, [bookingId, navigate]);

  const paid = booking?.paymentStatus === "PAID";
  const expired = booking?.bookingStatus === "EXPIRED" || holdExpired;
  const cancelled = booking?.bookingStatus === "CANCELLED";
  return <main className="min-h-screen bg-[#f6f7ff] px-4 py-12 text-slate-800">
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-9">
      {loading ? <p>Đang kiểm tra trạng thái thanh toán...</p> :
        error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div> :
          booking && <>
            <div className="flex flex-col items-center text-center">
              {paid ? <CheckCircle2 size={64} className="text-emerald-600" /> :
                expired || cancelled ? <XCircle size={64} className="text-red-600" /> :
                  <Clock3 size={64} className="text-amber-600" />}
              <p className="mt-4 text-sm font-semibold text-blue-700">GoRide · Bước 4/4</p>
              <h1 className="mt-1 text-2xl font-extrabold">
                {paid ? "Thanh toán thành công" : expired ? "Đơn đã hết hạn" : cancelled ? "Đơn đã hủy" : "Đơn đang chờ thanh toán"}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {paid ? "Ghế đã được xác nhận cho chuyến đi của bạn." :
                  expired ? "Thời gian giữ ghế đã kết thúc." :
                    cancelled ? "Đơn đặt chuyến này không còn hiệu lực." :
                    "Bạn có thể tiếp tục thanh toán trong thời gian giữ ghế."}
              </p>
            </div>
            <div className="mt-7 rounded-xl bg-slate-50 p-5 text-sm">
              <div className="space-y-3">
                <p><span className="text-slate-500">Mã đặt chuyến:</span> <b>{booking.bookingId}</b></p>
                <p><span className="text-slate-500">Tuyến:</span> {booking.routeName}</p>
                <p><span className="text-slate-500">Khởi hành:</span> {formatDeparture(booking.departureTime)}</p>
                <p><span className="text-slate-500">Điểm đón → trả:</span> {booking.pickupPoint} → {booking.dropoffPoint}</p>
                {booking.customerName && <p><span className="text-slate-500">Khách hàng:</span> {booking.customerName}</p>}
                {booking.contactPhone && <p><span className="text-slate-500">Liên hệ:</span> {booking.contactPhone}</p>}
                {booking.driverNote && <p><span className="text-slate-500">Ghi chú:</span> {booking.driverNote}</p>}
                <p><span className="text-slate-500">Số ghế:</span> {booking.seatCount}</p>
                {booking.seatNumbers.length > 0 && <p><span className="text-slate-500">Ghế:</span> {booking.seatNumbers.join(", ")}</p>}
                <p><span className="text-slate-500">Tổng tiền:</span> <b>{formatFare(booking.totalFare)}</b></p>
                {paid && <p><span className="text-slate-500">Giao dịch:</span> <b>{booking.transactionId}</b> ({booking.paymentMethod})</p>}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {!paid && !expired && !cancelled && <button type="button" onClick={() => navigate(`/booking/payment/${encodeURIComponent(booking.bookingId)}`)} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">Tiếp tục thanh toán</button>}
              <button type="button" onClick={() => navigate("/booking")} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">Đặt chuyến khác</button>
            </div>
          </>}
    </div>
  </main>;
}
