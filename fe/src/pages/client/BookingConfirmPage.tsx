
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Clock3,
  CalendarDays,
  CarFront,
  UserRound,
  CreditCard,
  Wallet,
  TicketPercent,
  Info,
  Headset,
  BadgeCheck,
  ChevronRight,
  Banknote,
} from "lucide-react";

type PaymentMethod = "cash" | "wallet" | "card";

type BookingPayload = {
  pickup_address: string;
  destination_address: string;
  requested_departure_at: string;
  seat_count: number;
  fare_per_seat: number;
  customer_name: string;
  phone: string;
  note: string;
  trip_type: string;
  vehicle_type: string;
};

type RawBooking = Partial<BookingPayload> & {
  pickup?: string;
  destination?: string;
  departure_time?: string;
  seats?: number;
  customer_phone?: string;
  estimated_total?: number;
};

type BookingLocationState = {
  booking?: RawBooking;
  estimated_total?: number;
  vehicle_name?: string;
};

const VEHICLES: Record<
  string,
  { name: string; description: string }
> = {
  "4-seat": {
    name: "GoRide 4 chỗ",
    description: "Cốp rộng · Điều hòa 2 chiều",
  },
  "4-seats": {
    name: "GoRide 4 chỗ",
    description: "Cốp rộng · Điều hòa 2 chiều",
  },
  "7-seat": {
    name: "GoRide 7 chỗ",
    description: "Không gian rộng · Phù hợp gia đình",
  },
  "7-seats": {
    name: "GoRide 7 chỗ",
    description: "Không gian rộng · Phù hợp gia đình",
  },
  "16-seats": {
    name: "GoRide 16 chỗ",
    description: "Không gian rộng cho nhóm khách",
  },
};

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  description: string;
  badge?: string;
  icon: typeof Banknote;
}[] = [
  {
    id: "cash",
    name: "Tiền mặt khi kết thúc chuyến",
    description: "Thanh toán trực tiếp cho tài xế sau khi đến nơi",
    badge: "Phổ biến",
    icon: Banknote,
  },
  {
    id: "wallet",
    name: "Ví điện tử ZaloPay / MoMo",
    description: "Thanh toán điện tử thuận tiện, không cần tiền mặt",
    badge: "Ví điện tử",
    icon: Wallet,
  },
  {
    id: "card",
    name: "Thẻ Visa / Mastercard / JCB",
    description:
      "Hỗ trợ thanh toán trực tuyến khi tích hợp cổng thanh toán",
    badge: "Thẻ ngân hàng",
    icon: CreditCard,
  },
];

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + "đ";

function formatDeparture(value: string) {
  if (!value) return "Chưa chọn";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTripType(value: string) {
  switch (value) {
    case "round-trip":
    case "round_trip":
      return "Đi hai chiều";
    case "hourly":
      return "Thuê xe theo giờ";
    default:
      return "Đi một chiều";
  }
}

function normalizeBooking(
  raw: RawBooking,
  estimatedTotal?: number,
): BookingPayload {
  const seatCount = Number(raw.seat_count ?? raw.seats ?? 1);

  const totalFromState = Number(
    estimatedTotal ?? raw.estimated_total ?? 0,
  );

  const farePerSeat = Number(
    raw.fare_per_seat ??
      (seatCount > 0 ? totalFromState / seatCount : 0),
  );

  return {
    pickup_address: String(
      raw.pickup_address ?? raw.pickup ?? "",
    ),
    destination_address: String(
      raw.destination_address ?? raw.destination ?? "",
    ),
    requested_departure_at: String(
      raw.requested_departure_at ?? raw.departure_time ?? "",
    ),
    seat_count: seatCount,
    fare_per_seat: farePerSeat,
    customer_name: String(raw.customer_name ?? ""),
    phone: String(raw.phone ?? raw.customer_phone ?? ""),
    note: String(raw.note ?? ""),
    trip_type: String(raw.trip_type ?? "one_way"),
    vehicle_type: String(raw.vehicle_type ?? "4-seats"),
  };
}

export default function BookingConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state ?? null) as
    | BookingLocationState
    | null;

  const rawBooking = state?.booking;

  const booking = useMemo(() => {
    if (!rawBooking) return null;

    return normalizeBooking(
      rawBooking,
      state?.estimated_total,
    );
  }, [rawBooking, state?.estimated_total]);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");

  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");

  const vehicle = useMemo(() => {
    if (!booking) return null;

    return (
      VEHICLES[booking.vehicle_type] ?? {
        name: state?.vehicle_name ?? booking.vehicle_type,
        description: "Thông tin xe đã chọn",
      }
    );
  }, [booking, state?.vehicle_name]);

  const subtotal = booking
    ? booking.fare_per_seat * booking.seat_count
    : 0;

  const total = Math.max(0, subtotal - discount);

  const departure = booking
    ? formatDeparture(booking.requested_departure_at)
    : "Chưa chọn";

  const applyPromo = () => {
    if (!promoCode.trim()) {
      setDiscount(0);
      setPromoMessage("Vui lòng nhập mã ưu đãi.");
      return;
    }

    // TODO: Kết nối API kiểm tra mã ưu đãi.
    setDiscount(0);
    setPromoMessage(
      "Chưa kết nối hệ thống mã ưu đãi. Vui lòng thử lại sau.",
    );
  };

  // Xác nhận và chuyển sang trang thành công.
  const handleConfirm = () => {
    if (!booking) {
      setError("Không tìm thấy thông tin chuyến xe. Vui lòng quay lại trang đặt xe.");
      return;
    }

    const confirmationPayload = {
      booking,
      estimated_total: total,
      vehicle_name: vehicle?.name ?? state?.vehicle_name ?? "",
      payment_method: paymentMethod,
      promo_code: promoCode.trim().toUpperCase(),
      booking_code: `GR-${Date.now().toString().slice(-6)}`,
      status: "pending",
    };

    // Chuyển sang trang thành công và truyền thông tin đặt xe
    navigate("/booking/success", {
      state: confirmationPayload,
    });
  };

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7ff] px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white bg-white p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Info size={25} />
          </div>

          <h1 className="text-xl font-extrabold text-slate-900">
            Chưa có thông tin chuyến xe
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Vui lòng quay lại trang đặt xe để nhập và kiểm tra thông tin.
          </p>

          <button
            type="button"
            onClick={() => navigate("/booking")}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            <ArrowLeft size={16} />
            Quay lại trang đặt xe
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7ff] px-3 py-4 text-slate-800 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[1240px]">
        {/* Tiến trình đặt xe */}
        <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-white bg-white p-2.5 shadow-sm">
          <div className="flex min-w-0 items-center gap-2 rounded-lg bg-emerald-50 p-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Check size={15} />
            </span>
            <div className="min-w-0">
              <p className="text-[8px] font-bold text-emerald-700 sm:text-[9px]">
                BƯỚC 1 · ĐÃ XONG
              </p>
              <p className="text-[9px] font-bold sm:text-[11px]">
                Nhập lộ trình & chọn xe
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded-lg bg-blue-50 p-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
              2
            </span>
            <div className="min-w-0">
              <p className="text-[8px] font-bold text-blue-700 sm:text-[9px]">
                BƯỚC 2 · HIỆN TẠI
              </p>
              <p className="text-[9px] font-bold sm:text-[11px]">
                Kiểm tra & xác nhận
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded-lg p-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">
              3
            </span>
            <div className="min-w-0">
              <p className="text-[8px] font-medium text-slate-400 sm:text-[9px]">
                BƯỚC 3
              </p>
              <p className="text-[9px] font-medium text-slate-500 sm:text-[11px]">
                Hoàn tất đặt xe
              </p>
            </div>
          </div>
        </div>

        <header className="mb-5">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-[9px] font-bold text-sky-800">
            <ShieldCheck size={12} />
            ĐỐI SOÁT CHUYẾN ĐI AN TOÀN
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Xác nhận thông tin chuyến đi
          </h1>

          <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
            Vui lòng kiểm tra lộ trình, thời gian khởi hành, thông tin
            thanh toán và giá cước trước khi tiếp tục.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.35fr_0.9fr]">
          {/* Chi tiết chuyến đi */}
          <div className="min-w-0 space-y-4">
            <section className="rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-extrabold">
                  <span className="rounded-lg bg-blue-100 p-2 text-blue-700">
                    <MapPin size={15} />
                  </span>
                  Chi tiết lộ trình
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/booking", {
                      state: { booking },
                    })
                  }
                  className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900"
                >
                  Chỉnh sửa
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="relative ml-1 space-y-5 pl-5">
                <div className="absolute bottom-4 left-[5px] top-3 border-l-2 border-dashed border-slate-200" />

                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-blue-600 bg-white" />
                  <p className="mb-1 text-[9px] font-extrabold text-blue-700">
                    ĐIỂM ĐÓN KHÁCH
                  </p>
                  <p className="break-words text-sm font-extrabold text-slate-900">
                    {booking.pickup_address || "Chưa nhập điểm đón"}
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-red-500 bg-white" />
                  <p className="mb-1 text-[9px] font-extrabold text-red-600">
                    ĐIỂM ĐẾN
                  </p>
                  <p className="break-words text-sm font-extrabold text-slate-900">
                    {booking.destination_address || "Chưa nhập điểm đến"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 rounded-xl bg-[#f1f3ff] p-3 sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-lg bg-blue-100 p-2 text-blue-700">
                    <CarFront size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-500">
                      PHƯƠNG TIỆN
                    </p>
                    <p className="text-xs font-extrabold text-slate-900">
                      {vehicle?.name}
                    </p>
                    <p className="text-[9px] text-emerald-700">
                      {vehicle?.description}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-lg bg-white p-2 text-slate-600">
                    <UserRound size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-500">
                      KHÁCH HÀNG
                    </p>
                    <p className="truncate text-xs font-extrabold text-slate-900">
                      {booking.customer_name || "Chưa nhập tên"}
                    </p>
                    <p className="break-all text-[9px] text-slate-500">
                      {booking.phone || "Chưa nhập số điện thoại"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-start gap-2 rounded-lg border border-slate-100 p-3">
                  <CalendarDays size={15} className="mt-0.5 shrink-0 text-blue-700" />
                  <div>
                    <p className="text-[9px] text-slate-500">
                      Thời gian khởi hành
                    </p>
                    <p className="text-xs font-bold leading-5 text-slate-800">
                      {departure}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-slate-100 p-3">
                  <Clock3 size={15} className="mt-0.5 shrink-0 text-blue-700" />
                  <div>
                    <p className="text-[9px] text-slate-500">
                      Hình thức chuyến đi
                    </p>
                    <p className="text-xs font-bold text-slate-800">
                      {getTripType(booking.trip_type)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {booking.seat_count} khách
                    </p>
                  </div>
                </div>
              </div>

              {booking.note.trim() && (
                <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                  <p className="text-[10px] font-bold text-amber-800">
                    Ghi chú cho tài xế
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-700">
                    {booking.note}
                  </p>
                </div>
              )}
            </section>

            {/* Phương thức thanh toán */}
            <section className="rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-extrabold">
                  <span className="rounded-lg bg-sky-100 p-2 text-sky-700">
                    <Wallet size={16} />
                  </span>
                  Phương thức thanh toán
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-700">
                  Linh hoạt
                </span>
              </div>

              <p className="mb-4 text-[10px] leading-5 text-slate-500">
                Chọn hình thức thanh toán. Giao dịch thực tế cần được
                tích hợp với backend hoặc cổng thanh toán.
              </p>

              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  const selected = paymentMethod === method.id;
                  const Icon = method.icon;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      aria-pressed={selected}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-blue-300 bg-[#f0f2ff] ring-1 ring-blue-100"
                          : "border-slate-100 bg-white hover:border-blue-200"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-blue-700"
                            : "border-slate-300"
                        }`}
                      >
                        {selected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-700" />
                        )}
                      </span>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-extrabold text-slate-800">
                            {method.name}
                          </span>
                          {method.badge && selected && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700">
                              {method.badge}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-[9px] leading-4 text-slate-500">
                          {method.description}
                        </span>
                      </span>

                      {selected && (
                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-blue-700"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Cước phí và xác nhận */}
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-4">
            <section className="rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-extrabold">
                  <CreditCard size={17} className="text-blue-700" />
                  Phân tích cước phí
                </h2>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">
                  Giá tham khảo
                </span>
              </div>

              <div className="space-y-3 text-[10px]">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500">Cước cơ sở / khách</span>
                  <span className="text-right font-bold tabular-nums">
                    {formatMoney(booking.fare_per_seat)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500">Số khách</span>
                  <span className="font-bold">
                    {booking.seat_count}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500">Ưu đãi</span>
                  <span className="font-bold text-emerald-700">
                    {discount > 0
                      ? `-${formatMoney(discount)}`
                      : "0đ"}
                  </span>
                </div>
              </div>

              <div className="my-4 border-t border-dashed border-slate-200" />

              <div>
                <label
                  htmlFor="promo-code"
                  className="mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-700"
                >
                  <TicketPercent size={14} className="text-blue-700" />
                  Nhập mã ưu đãi
                </label>

                <div className="flex gap-2">
                  <input
                    id="promo-code"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value);
                      setPromoMessage("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyPromo();
                      }
                    }}
                    placeholder="Nhập mã (nếu có)"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-[#f1f3ff] px-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={applyPromo}
                    className="rounded-lg bg-blue-100 px-3 py-2 text-[10px] font-extrabold text-blue-700 transition hover:bg-blue-200"
                  >
                    Áp dụng
                  </button>
                </div>

                {promoMessage && (
                  <p className="mt-2 text-[10px] leading-4 text-slate-500">
                    {promoMessage}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-xl bg-[#f0f2ff] p-4">
                <p className="text-[9px] font-extrabold text-slate-600">
                  TỔNG GIÁ ƯỚC TÍNH
                </p>
                <p className="mt-1 text-[9px] leading-4 text-slate-500">
                  Giá tham khảo cho {booking.seat_count} khách
                </p>

                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[10px] text-slate-500">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-extrabold tracking-tight text-blue-700 sm:text-3xl">
                    {formatMoney(total)}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/80 p-2.5">
                  <Info size={13} className="mt-0.5 shrink-0 text-blue-700" />
                  <p className="text-[9px] leading-4 text-slate-500">
                    Giá cuối cùng cần được backend xác nhận. Không bao gồm
                    phí phát sinh nếu chưa có dữ liệu tương ứng.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 p-3">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-800">
                    Thông tin minh bạch
                  </p>
                  <p className="mt-1 text-[9px] leading-4 text-slate-600">
                    Kiểm tra lại lộ trình và giá trước khi xác nhận.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <BadgeCheck size={17} className="text-emerald-600" />
                <h2 className="text-xs font-extrabold">
                  Sẵn sàng xác nhận chuyến đi?
                </h2>
              </div>

              <p className="mb-4 text-[10px] leading-5 text-slate-500">
                Vui lòng kiểm tra thông tin trước khi tiếp tục.
              </p>

              <button
                type="button"
                onClick={handleConfirm}
                
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
              >
                Xác nhận đặt xe ngay
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/booking")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0f2ff] px-4 py-3 text-[10px] font-bold text-slate-700 transition hover:bg-blue-100"
              >
                <ArrowLeft size={13} />
                Quay lại chỉnh sửa
              </button>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center justify-center gap-1 rounded-lg bg-slate-50 p-2 text-center text-[9px] text-slate-600">
                  <ShieldCheck size={12} className="shrink-0 text-emerald-600" />
                  Thông tin bảo mật
                </div>
                <div className="flex items-center justify-center gap-1 rounded-lg bg-slate-50 p-2 text-center text-[9px] text-slate-600">
                  <CheckCircle2 size={12} className="shrink-0 text-blue-600" />
                  Kiểm tra trước khi gửi
                </div>
              </div>
            </section>

            <section className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-[#edf0ff] p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-700">
                <Headset size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold text-slate-800">
                  Cần hỗ trợ đặt xe?
                </p>
                <p className="mt-1 text-[9px] leading-4 text-slate-500">
                  Liên hệ bộ phận hỗ trợ theo thông tin chính thức của GoRide.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
