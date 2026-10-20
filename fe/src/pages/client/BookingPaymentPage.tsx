import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CreditCard, Wallet } from "lucide-react";
import { isAuthenticated } from "@/services/auth.service";
import {
  bookingApi, bookingErrorMessage, bookingErrorStatus, formatDeparture, formatFare, type BookingDetail,
} from "@/services/booking.service";

const methods = [
  { id: "MOMO", label: "Ví MoMo" },
  { id: "CARD", label: "Thẻ ngân hàng" },
  { id: "BANK_TRANSFER", label: "Chuyển khoản" },
  { id: "CASH", label: "Tiền mặt" },
] as const;

export default function BookingPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [method, setMethod] = useState<string>(() => {
    const preferred = (location.state as { paymentMethod?: string } | null)?.paymentMethod;
    return methods.some((option) => option.id === preferred) ? preferred! : "MOMO";
  });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [holdExpired, setHoldExpired] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    if (!isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent(`/booking/payment/${bookingId}`)}`, { replace: true });
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
          navigate(`/login?redirect=${encodeURIComponent(`/booking/payment/${bookingId}`)}`, { replace: true });
        } else setError(bookingErrorMessage(cause));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; if (expiryTimer) window.clearTimeout(expiryTimer); };
  }, [bookingId, navigate]);

  const expired = booking?.bookingStatus === "EXPIRED" || holdExpired;

  const pay = async () => {
    if (!booking || paying) return;
    setPaying(true);
    setError("");
    try {
      await bookingApi.pay(booking.bookingId, method, booking.totalFare);
      navigate(`/booking/result/${encodeURIComponent(booking.bookingId)}`, { replace: true });
    } catch (cause) {
      if (bookingErrorStatus(cause) === 401) {
        navigate(`/login?redirect=${encodeURIComponent(`/booking/payment/${booking.bookingId}`)}`, { replace: true });
        return;
      }
      setError(bookingErrorMessage(cause));
      try {
        const updated = await bookingApi.booking(booking.bookingId);
        setBooking(updated);
        setHoldExpired(updated.bookingStatus === "EXPIRED" ||
          (updated.paymentStatus === "PENDING" && new Date(updated.expiresAt).getTime() <= Date.now()));
      } catch { /* Keep the current summary. */ }
    } finally { setPaying(false); }
  };

  return <main className="min-h-screen bg-[#f6f7ff] px-4 py-8 text-slate-800">
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-semibold text-blue-700">GoRide · Bước 3/4</p>
      <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Thanh toán giả lập</h1>
      <p className="mt-2 text-sm text-slate-500">Chọn phương thức để mô phỏng giao dịch cho đơn đã giữ ghế.</p>
      {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <p className="mt-6 rounded-2xl bg-white p-6">Đang tải đơn đặt chuyến...</p> :
        !booking ? <button type="button" onClick={() => navigate("/booking")} className="mt-6 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">Quay lại đặt vé</button> :
          <div className="mt-6 grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Wallet size={20} className="text-blue-700" />Phương thức thanh toán</h2>
              <div className="mt-4 space-y-3">
                {methods.map((option) => <button key={option.id} type="button" aria-pressed={method === option.id} onClick={() => setMethod(option.id)} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left font-semibold ${method === option.id ? "border-blue-700 bg-blue-50 text-blue-800" : "border-slate-200 hover:border-blue-300"}`}>
                  {option.label}<span className={`h-4 w-4 rounded-full border-2 ${method === option.id ? "border-blue-700 bg-blue-700" : "border-slate-300"}`} />
                </button>)}
              </div>
              <p className="mt-4 text-xs text-slate-500">Đây là thanh toán giả lập; hệ thống không thu tiền thực.</p>
            </section>
            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold"><CreditCard size={20} className="text-blue-700" />Đơn {booking.bookingId.slice(0, 8)}</h2>
              <div className="mt-5 space-y-3 text-sm">
                <p><span className="text-slate-500">Tuyến:</span> {booking.routeName}</p>
                <p><span className="text-slate-500">Khởi hành:</span> {formatDeparture(booking.departureTime)}</p>
                <p><span className="text-slate-500">Điểm đón:</span> {booking.pickupPoint}</p>
                <p><span className="text-slate-500">Điểm trả:</span> {booking.dropoffPoint}</p>
                <p><span className="text-slate-500">Ghế:</span> {booking.seatNumbers.join(", ") || "Đã hết hạn"}</p>
                <p><span className="text-slate-500">Giữ ghế đến:</span> {formatDeparture(booking.expiresAt)}</p>
              </div>
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">Số tiền cần thanh toán</p>
                <p className="text-3xl font-extrabold text-blue-700">{formatFare(booking.totalFare)}</p>
              </div>
              {booking.paymentStatus === "PAID" ?
                <button type="button" onClick={() => navigate(`/booking/result/${encodeURIComponent(booking.bookingId)}`)} className="mt-5 w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white">Xem kết quả</button> :
                expired || booking.bookingStatus !== "PENDING" ?
                  <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                    {expired ? "Thời gian giữ ghế đã hết." : "Đơn này không còn được thanh toán."} Vui lòng tạo đơn mới.
                  </div> :
                  <button type="button" onClick={pay} disabled={paying} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-bold text-white disabled:bg-slate-400">
                    {paying ? "Đang xử lý..." : "Xác nhận thanh toán"} <ArrowRight size={17} />
                  </button>}
              <button type="button" onClick={() => navigate("/booking")} className="mt-3 flex items-center gap-1 text-sm font-semibold text-blue-700"><ArrowLeft size={15} />Đặt chuyến khác</button>
            </aside>
          </div>}
    </div>
  </main>;
}
