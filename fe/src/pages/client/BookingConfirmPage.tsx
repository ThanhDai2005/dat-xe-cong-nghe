import { useState } from "react";
import { useLocation, Link } from "react-router";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  ShieldCheck,
  User,
  Phone,
  QrCode,
  Wallet,
  Building2,
  Banknote,
  ArrowRight,
  AlertCircle,
  Car,
} from "lucide-react";
import { customerApi } from "@/services/customer.service";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

export default function BookingConfirmPage() {
  const location = useLocation();

  const state = location.state || {};
  const { booking, trip, customerName, contactPhone, selectedSeats } = state;

  const [paymentMethod, setPaymentMethod] = useState<"VNPAY" | "MOMO" | "BANK_TRANSFER" | "CASH">("VNPAY");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<any | null>(null);

  if (!booking?.bookingId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin đơn đặt</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Vui lòng quay lại trang đặt chuyến để chọn lộ trình và ghế ngồi.
        </p>
        <Link
          to="/booking"
          className="px-6 py-2.5 rounded-xl bg-[#0050c8] text-white font-bold text-sm shadow-md"
        >
          Đặt vé ngay
        </Link>
      </div>
    );
  }

  const handlePay = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await customerApi.processPayment({
        bookingId: booking.bookingId,
        paymentMethod,
        amount: booking.totalFare,
      });

      if (res.data?.status === "SUCCESS") {
        setSuccessData(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Xử lý thanh toán thất bại, vui lòng thử lại");
    } finally {
      setBusy(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200/80 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
            ĐẶT VÉ & THANH TOÁN THÀNH CÔNG
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Cảm Ơn Quý Khách Đã Đặt Chuyến!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Mã giao dịch điện tử của bạn là{" "}
            <strong className="text-slate-800">#{successData.transactionId.slice(0, 8)}</strong>. Vé
            điện tử đã được xác nhận vào lịch trình của bạn.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Mã đơn vé:</span>
              <span className="font-bold text-slate-900">#{booking.bookingId.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Lộ trình:</span>
              <span className="font-bold text-slate-900">{trip?.routeName || "Tuyến cố định"}</span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Ghế ngồi đã đặt:</span>
              <span className="font-bold text-[#0050c8]">
                {selectedSeats?.map((s: string) => `Ghế ${s}`).join(", ")}
              </span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Hành khách:</span>
              <span className="font-bold text-slate-900">
                {customerName} ({contactPhone})
              </span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-500">Tổng tiền đã thanh toán:</span>
              <span className="font-black text-emerald-600 text-base">
                {formatPrice(booking.totalFare)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/profile"
              className="px-6 py-3 rounded-xl bg-[#0050c8] hover:bg-[#0040a2] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              Xem lịch sử chuyến đi
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
            >
              Về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0050c8] block mb-1">
            Bước 2 / 2: Xác nhận & Thanh toán
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Thanh Toán Đơn Đặt Vé
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Đơn vé được giữ chỗ trong 15 phút. Vui lòng hoàn tất thanh toán để nhận vé điện tử.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Cột trái: Tóm tắt vé */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Car className="w-4 h-4 text-[#0050c8]" />
                Chi tiết vé chuyến xe
              </h2>

              <div className="mt-4 space-y-3">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/80">
                  <span className="text-xs font-bold text-[#0050c8] uppercase block mb-1">
                    Hành trình
                  </span>
                  <p className="text-base font-black text-slate-900">
                    {trip?.routeName || "Hà Nội → Hải Phòng"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Khởi hành:{" "}
                    {new Date(trip?.departureTime || Date.now()).toLocaleString("vi-VN", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 block mb-0.5">Ghế đã chọn:</span>
                    <span className="font-bold text-[#0050c8]">
                      {selectedSeats?.map((s: string) => `Ghế ${s}`).join(", ")}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-400 block mb-0.5">Số lượng:</span>
                    <span className="font-bold text-slate-800">
                      {booking.seatCount || selectedSeats?.length || 1} vé
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#0050c8]" />
                    <span>Hành khách: <strong>{customerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#0050c8]" />
                    <span>SĐT đón: <strong>{contactPhone}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0050c8]" />
                Chọn cổng thanh toán
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {[
                  {
                    id: "VNPAY",
                    name: "Cổng VNPAY",
                    desc: "Quét mã VietQR / Thẻ ATM",
                    icon: QrCode,
                  },
                  {
                    id: "MOMO",
                    name: "Ví MoMo",
                    desc: "Thanh toán ví điện tử",
                    icon: Wallet,
                  },
                  {
                    id: "BANK_TRANSFER",
                    name: "Chuyển khoản",
                    desc: "Chuyển khoản 24/7",
                    icon: Building2,
                  },
                  {
                    id: "CASH",
                    name: "Tiền mặt",
                    desc: "Thanh toán cho tài xế",
                    icon: Banknote,
                  },
                ].map((item) => {
                  const isChecked = paymentMethod === item.id;
                  const Icon = item.icon;
                  return (
                    <label
                      key={item.id}
                      onClick={() => setPaymentMethod(item.id as any)}
                      className={`p-4 rounded-xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                        isChecked
                          ? "border-[#0050c8] bg-blue-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isChecked ? "bg-[#0050c8] text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cột phải: Hóa đơn thanh toán */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 sticky top-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Tóm tắt chi phí
              </h2>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Giá mỗi ghế:</span>
                  <span className="font-semibold text-slate-800">
                    {formatPrice(booking.farePerSeat || trip?.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Số lượng ghế:</span>
                  <span className="font-semibold text-slate-800">
                    x{booking.seatCount || selectedSeats?.length || 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí dịch vụ & Bảo hiểm:</span>
                  <span className="font-semibold text-emerald-600">Miễn phí (0đ)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-[#0050c8]">
                    {formatPrice(booking.totalFare)}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Đã gồm VAT
                </span>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={handlePay}
                className="w-full py-4 rounded-xl bg-[#0050c8] hover:bg-[#0040a2] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {busy ? (
                  "Đang xác thực thanh toán..."
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Xác nhận & Thanh toán ngay
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Bảo mật mã hóa chuẩn SSL 256-bit • Hỗ trợ hoàn vé 100% theo chính sách.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
