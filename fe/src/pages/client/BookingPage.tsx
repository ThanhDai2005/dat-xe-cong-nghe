
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  CalendarDays,
  Clock3,
  ShieldCheck,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Navigation,
  Info,
  Users,
} from "lucide-react";

import { formatMoney } from "../../components/client/bookingCardData";
import GoogleMapLocationPicker from "@/components/client/GoogleMapLocationPicker";
import {
  bookingApi, bookingErrorMessage, type BookingDraft, type RouteOption,
  type SeatAvailability, type TripDetail, type TripOption,
} from "@/services/booking.service";

type VehicleOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  seats: number;
  availableSeats: number;
  tag: string;
};

const VEHICLE_TIERS = [
  {
    seats: 4,
    name: "GoRide 4 chỗ",
    description: "Sedan đô thị êm ái, cốp sau vừa vặn 2 vali size trung. Tiết kiệm tối ưu trong nội thành.",
    tag: "Tiết kiệm",
  },
  {
    seats: 7,
    name: "GoRide 7 chỗ",
    description: "Dòng xe SUV/MPV rộng rãi, phù hợp gia đình và hành khách có nhiều hành lý.",
    tag: "Không gian rộng",
  },
];

export type BookingPayload = {
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

const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-200 bg-[#f0f2ff] px-3 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

function getDefaultDate(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function getDefaultTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}

function getPhoneError(prefix: string, phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "Vui lòng nhập số điện thoại.";
  }

  if (prefix === "+84" && !/^(0?[3-9]\d{8})$/.test(digits)) {
    return "Số điện thoại Việt Nam phải có 10 số, hoặc 9 số nếu bỏ số 0 đầu.";
  }

  if (prefix === "+1" && !/^[2-9]\d{9}$/.test(digits)) {
    return "Số điện thoại Mỹ phải có 10 chữ số hợp lệ.";
  }

  if (prefix === "+65" && !/^[689]\d{7}$/.test(digits)) {
    return "Số điện thoại Singapore phải có 8 chữ số hợp lệ.";
  }

  return "";
}

function splitPhone(value = ""): { prefix: string; phone: string } {
  const match = value.trim().match(/^(\+84|\+1|\+65)\s*(.*)$/);

  if (match) {
    return {
      prefix: match[1],
      phone: match[2].replace(/\D/g, ""),
    };
  }

  return {
    prefix: "+84",
    phone: value.replace(/\D/g, ""),
  };
}

function splitDeparture(value?: string): {
  date: string;
  time: string;
} {
  if (!value) {
    return {
      date: getDefaultDate(),
      time: getDefaultTime(),
    };
  }

  const departure = new Date(value);
  if (Number.isNaN(departure.getTime())) return { date: getDefaultDate(), time: getDefaultTime() };
  return {
    date: `${departure.getFullYear()}-${String(departure.getMonth() + 1).padStart(2, "0")}-${String(departure.getDate()).padStart(2, "0")}`,
    time: `${String(departure.getHours()).padStart(2, "0")}:${String(departure.getMinutes()).padStart(2, "0")}`,
  };
}

const isPastDeparture = (value: Date) => value.getTime() < Date.now();

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  // Nhận lại dữ liệu khi người dùng quay về từ BookingConfirmPage.
  const restoredBooking = location.state?.booking as
    | BookingPayload
    | undefined;
  const restoredDraft = location.state?.draft as BookingDraft | undefined;

  const initialDeparture = splitDeparture(
    restoredBooking?.requested_departure_at ?? params.get("departureAt") ?? undefined,
  );

  const initialPhone = splitPhone(restoredBooking?.phone);

  const [pickup, setPickup] = useState(
    restoredBooking?.pickup_address ?? params.get("pickup") ?? "",
  );

  const [destination, setDestination] = useState(
    restoredBooking?.destination_address ??
      params.get("destination") ??
      "",
  );

  const [tripType, setTripType] = useState(
    restoredBooking?.trip_type ?? "one-way",
  );

  const [vehicleId, setVehicleId] = useState(
    restoredDraft?.tripId ?? params.get("tripId") ?? "",
  );

  const [seatCount, setSeatCount] = useState(
    restoredBooking?.seat_count ?? 1,
  );

  const [departureDate, setDepartureDate] = useState(
    initialDeparture.date,
  );

  const [departureTime, setDepartureTime] = useState(
    initialDeparture.time,
  );

  const [customerName, setCustomerName] = useState(
    restoredBooking?.customer_name ?? "",
  );

  const [phonePrefix, setPhonePrefix] = useState(
    initialPhone.prefix,
  );

  const [phone, setPhone] = useState(initialPhone.phone);

  const [note, setNote] = useState(restoredBooking?.note ?? "");

  const [faqOpen, setFaqOpen] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [routeId, setRouteId] = useState(restoredDraft?.routeId ?? params.get("route") ?? "");
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [seats, setSeats] = useState<SeatAvailability | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(restoredDraft?.seatNumbers ?? []);
  const [pickupPointId, setPickupPointId] = useState(restoredDraft?.pickupPointId ?? "");
  const [dropoffPointId, setDropoffPointId] = useState(restoredDraft?.dropoffPointId ?? "");
  const [bookingTypeId, setBookingTypeId] = useState(restoredDraft?.bookingTypeId ?? "");

  useEffect(() => {
    let active = true;
    bookingApi.routes().then((rows) => { if (active) setRoutes(rows); })
      .catch((cause) => { if (active) setError(bookingErrorMessage(cause)); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!routeId || !departureDate) return;
    let active = true;
    bookingApi.trips(routeId, departureDate).then((rows) => { if (active) setTrips(rows); })
      .catch((cause) => { if (active) setError(bookingErrorMessage(cause)); });
    return () => { active = false; };
  }, [routeId, departureDate]);

  useEffect(() => {
    if (!vehicleId) return;
    let active = true;
    Promise.all([bookingApi.trip(vehicleId), bookingApi.seats(vehicleId)])
      .then(([detail, availability]) => {
        if (!active) return;
        if (detail.routeId !== routeId) {
          setError("Chuyến xe không thuộc tuyến đã chọn.");
          return;
        }
        setTrip(detail);
        setSeats(availability);
        setBookingTypeId((current) => current || detail.fareOptions.find((option) => option.farePerSeat !== null)?.bookingTypeId || "");
        setSelectedSeats((current) => current.filter((seat) => !availability.bookedSeats.includes(seat)));
      })
      .catch((cause) => { if (active) setError(bookingErrorMessage(cause)); });
    return () => { active = false; };
  }, [vehicleId, routeId]);

  const displayTrips = trip && seats && trip.status === "OPEN" &&
    !trips.some((option) => option.tripId === trip.tripId)
    ? [...trips, {
      tripId: trip.tripId, routeName: trip.routeName, departureTime: trip.departureTime,
      vehicleType: trip.vehicleName, price: trip.price, totalSeats: trip.totalSeats,
      availableSeats: seats.availableSeats,
    }] : trips;
  const vehicles: VehicleOption[] = displayTrips.map((option) => {
    const tier = VEHICLE_TIERS.find((item) => item.seats === option.totalSeats);
    return {
      id: option.tripId,
      name: tier ? `${tier.name} · ${option.vehicleType}` : `Xe ${option.vehicleType}`,
      description: `${tier?.description ?? "Chuyến xe theo lịch của GoRide."} Khởi hành ${new Date(option.departureTime).toLocaleString("vi-VN")}. Còn ${option.availableSeats} ghế.`,
      price: option.price ?? 0,
      seats: option.totalSeats,
      availableSeats: option.availableSeats,
      tag: `${tier?.tag ?? "Chuyến đang mở"} · ${option.availableSeats} ghế trống`,
    };
  });

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId) ??
    { id: "", name: "Chưa chọn chuyến", description: "", price: 0, seats: 0, availableSeats: 0, tag: "" };

  const selectedFare = trip?.fareOptions.find((option) => option.bookingTypeId === bookingTypeId);
  const pickupStop = trip?.stops.find((stop) => stop.stopId === pickupPointId);
  const dropoffStop = trip?.stops.find((stop) => stop.stopId === dropoffPointId);
  const dropoffStops = trip?.stops.filter((stop) =>
    (stop.type === "DROPOFF" || stop.type === "BOTH") &&
    (!pickupStop || stop.stopOrder > pickupStop.stopOrder)) ?? [];
  const totalPrice = (selectedFare?.farePerSeat ?? selectedVehicle.price) * seatCount;

  const departure = useMemo(() => {
    if (!departureDate || !departureTime) return "Chưa chọn";

    const [year, month, day] = departureDate.split("-");

    return `${day}/${month}/${year} · ${departureTime}`;
  }, [departureDate, departureTime]);

  const clearError = () => setError("");

  const updatePickup = (address: string) => {
    setPickup(address);
    setPickupPointId("");
    setDropoffPointId("");
    clearError();
  };

  const updateDestination = (address: string) => {
    setDestination(address);
    setDropoffPointId("");
    clearError();
  };

  const validate = (): boolean => {
    if (!routeId || !trip || !seats || trip.tripId !== vehicleId) {
      setError("Vui lòng chọn một chuyến xe đang mở.");
      return false;
    }
    if (trip.status !== "OPEN" || isPastDeparture(new Date(trip.departureTime))) {
      setError("Chuyến xe đã ngừng nhận đặt hoặc đã khởi hành.");
      return false;
    }
    if (tripType !== "one-way") {
      setError("API hiện chỉ hỗ trợ chuyến một chiều. Vui lòng chọn Đi một chiều.");
      return false;
    }
    if (!pickupStop || !dropoffStop || pickupStop.stopOrder >= dropoffStop.stopOrder) {
      setError("Vui lòng chọn điểm đón và điểm trả hợp lệ trên tuyến.");
      return false;
    }
    if (!selectedFare || selectedFare.farePerSeat === null) {
      setError("Chuyến xe chưa có giá vé cho hình thức đã chọn.");
      return false;
    }
    if (selectedSeats.length !== seatCount || selectedSeats.some((seat) => seats.bookedSeats.includes(seat))) {
      setError(`Vui lòng chọn đúng ${seatCount} ghế còn trống.`);
      return false;
    }
    if (!pickup.trim()) {
      setError("Vui lòng chọn hoặc nhập địa chỉ điểm đón.");
      return false;
    }

    if (!destination.trim()) {
      setError("Vui lòng chọn hoặc nhập địa chỉ điểm đến.");
      return false;
    }

    if (!departureDate || !departureTime) {
      setError("Vui lòng chọn ngày và giờ khởi hành.");
      return false;
    }

    const departureDateTime = new Date(
      `${departureDate}T${departureTime}:00`,
    );

    if (Number.isNaN(departureDateTime.getTime())) {
      setError("Ngày hoặc giờ khởi hành không hợp lệ.");
      return false;
    }

    if (isPastDeparture(departureDateTime)) {
      setError("Thời gian khởi hành phải ở hiện tại hoặc tương lai.");
      return false;
    }

    if (
      !Number.isInteger(seatCount) ||
      seatCount < 1 ||
      seatCount > selectedVehicle.availableSeats
    ) {
      setError(
        `Vui lòng chọn từ 1 đến ${selectedVehicle.availableSeats} ghế còn trống.`,
      );
      return false;
    }

    if (!customerName.trim()) {
      setError("Vui lòng nhập họ và tên khách hàng.");
      return false;
    }

    const phoneError = getPhoneError(phonePrefix, phone);

    if (phoneError) {
      setError(phoneError);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    setError("");

    if (submitting || !validate()) return;

    const normalizedPhone = phone.replace(/\D/g, "");

    const payload: BookingPayload = {
      pickup_address: pickup.trim(),
      destination_address: destination.trim(),
      requested_departure_at: trip!.departureTime,
      seat_count: seatCount,
      fare_per_seat: selectedFare!.farePerSeat!,
      customer_name: customerName.trim(),
      phone: `${phonePrefix} ${normalizedPhone}`,
      note: note.trim(),
      trip_type: tripType,
      vehicle_type: trip!.vehicleName,
    };

    const draft: BookingDraft = {
      routeId,
      tripId: trip!.tripId,
      routeName: trip!.routeName,
      departureTime: trip!.departureTime,
      vehicleName: trip!.vehicleName,
      seatNumbers: [...selectedSeats].sort((a, b) => Number(a) - Number(b)),
      pickupPointId,
      pickupPoint: pickupStop!.stopName,
      dropoffPointId,
      dropoffPoint: dropoffStop!.stopName,
      bookingTypeId,
      bookingTypeName: selectedFare!.typeName,
      farePerSeat: selectedFare!.farePerSeat!,
      customerName: customerName.trim(),
      contactPhone: `${phonePrefix} ${normalizedPhone}`,
      driverNote: note.trim(),
      pickupAddress: pickup.trim(),
      dropoffAddress: destination.trim(),
    };

    setSubmitting(true);

    try {
      sessionStorage.setItem("bookingReview", JSON.stringify({ booking: payload, draft, vehicle_name: selectedVehicle.name }));
      // Chuyển sang trang xác nhận và gửi dữ liệu qua React Router state.
      navigate("/booking/confirm", {
        state: {
          booking: payload,
          draft,
          estimated_total: totalPrice,
          vehicle_name: selectedVehicle.name,
        },
      });
    } catch (err) {
      console.error("Không thể chuyển sang trang xác nhận:", err);
      setError("Không thể chuyển sang trang xác nhận. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8ff] px-3 py-5 text-slate-800 sm:px-5">
      <div className="mx-auto max-w-[1240px]">
        <header className="mb-5">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold">
            <span className="rounded-full bg-cyan-100 px-2 py-1 text-slate-700">
              HỆ THỐNG TRỰC TUYẾN 24/7
            </span>
            <span className="text-emerald-700">
              ✓ Điều phối tự động dưới 3 phút
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Đặt chuyến xe <span className="text-blue-700">GoRide</span>
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                Nhập thông tin lộ trình để tra cứu và ước tính giá cước
                trước khi xác nhận chuyến đi.
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-white bg-white p-3 shadow-sm sm:flex">
              <ShieldCheck className="text-blue-600" size={22} />
              <div>
                <p className="text-[10px] text-slate-500">
                  Bảo vệ quyền lợi
                </p>
                <p className="text-xs font-bold">Giá tham khảo</p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <Info size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <section className="min-w-0 space-y-5 rounded-2xl border border-white bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.07)] sm:p-5">
            {/* 01 - Lộ trình */}
            <section>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-extrabold">
                  <span className="rounded bg-blue-100 px-1.5 py-1 text-[10px] text-blue-700">
                    01
                  </span>
                  Lộ trình di chuyển
                </h2>
                <span className="text-[9px] text-slate-500">
                  Chọn điểm dừng của tuyến; bản đồ để tham khảo địa chỉ
                </span>
              </div>

              <label className="mb-3 block text-[10px] font-bold text-slate-700">
                Tuyến đường
                <select value={routeId} className={inputClass} onChange={(event) => {
                  setRouteId(event.target.value); setTrips([]); setVehicleId(""); setTrip(null); setSeats(null);
                  setSelectedSeats([]); setPickupPointId(""); setDropoffPointId(""); clearError();
                }}>
                  <option value="">Chọn tuyến đường</option>
                  {routes.map((route) => <option key={route.routeId} value={route.routeId}>{route.origin} → {route.destination}</option>)}
                </select>
              </label>

              <div className="space-y-3 rounded-xl bg-[#f0f2ff] p-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-[10px] font-extrabold text-blue-700">
                    <MapPin size={12} />
                    ĐIỂM ĐÓN
                  </label>
                  <GoogleMapLocationPicker
                    label=""
                    value={pickup}
                    placeholder="Xem hoặc tìm địa chỉ điểm đón trên bản đồ"
                    onChange={updatePickup}
                    markerColor="#2563eb"
                  />
                  <select value={pickupPointId} className={`${inputClass} mt-2`} disabled={!trip} onChange={(event) => {
                    const stop = trip?.stops.find((item) => item.stopId === event.target.value);
                    setPickupPointId(event.target.value); setDropoffPointId(""); setPickup(stop?.address || stop?.stopName || "");
                  }}>
                    <option value="">Chọn điểm đón trên tuyến</option>
                    {trip?.stops.filter((stop) => stop.type === "PICKUP" || stop.type === "BOTH").map((stop) =>
                      <option key={stop.stopId} value={stop.stopId}>{stop.stopName} — {stop.address}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-[10px] font-extrabold text-red-600">
                    <MapPin size={12} />
                    ĐIỂM ĐẾN
                  </label>
                  <GoogleMapLocationPicker
                    label=""
                    value={destination}
                    placeholder="Xem hoặc tìm địa chỉ điểm đến trên bản đồ"
                    onChange={updateDestination}
                    markerColor="#ef4444"
                  />
                  <select value={dropoffPointId} className={`${inputClass} mt-2`} disabled={!pickupPointId} onChange={(event) => {
                    const stop = trip?.stops.find((item) => item.stopId === event.target.value);
                    setDropoffPointId(event.target.value); setDestination(stop?.address || stop?.stopName || "");
                  }}>
                    <option value="">Chọn điểm trả sau điểm đón</option>
                    {dropoffStops.map((stop) =>
                      <option key={stop.stopId} value={stop.stopId}>{stop.stopName} — {stop.address}</option>)}
                  </select>
                </div>

                <div>
                  <p className="mb-1.5 text-[10px] text-slate-500">
                    Gợi ý tra cứu trên bản đồ (vẫn cần chọn điểm dừng hợp lệ):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Sân bay Tân Sơn Nhất",
                      "Chợ Bến Thành",
                      "Landmark 81",
                      "Ga Sài Gòn",
                    ].map((place) => (
                      <button
                        key={place}
                        type="button"
                        onClick={() => {
                          if (!pickup.trim()) updatePickup(place);
                          else updateDestination(place);
                        }}
                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700"
                      >
                        <MapPin size={10} className="mr-1 inline" />
                        {place}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 02 - Thời gian */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
                <span className="rounded bg-blue-100 px-1.5 py-1 text-[10px] text-blue-700">
                  02
                </span>
                Thời gian & hình thức đặt xe
              </h2>

              <div className="mb-3 grid grid-cols-1 gap-1 rounded-lg bg-[#f0f2ff] p-1 sm:grid-cols-3">
                {[
                  ["one-way", "Đi một chiều"],
                  ["round-trip", "Đi hai chiều"],
                  ["hourly", "Thuê xe theo giờ"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setTripType(value);
                      clearError();
                    }}
                    className={`rounded-md px-2 py-2 text-[10px] font-semibold transition ${
                      tripType === value
                        ? "bg-blue-700 text-white shadow"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {tripType !== "one-way" && <p className="mb-3 text-[10px] text-amber-700">
                Hình thức này đang được giới thiệu; API đặt chuyến hiện chỉ hỗ trợ một chiều.
              </p>}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="departure-date"
                    className="mb-1 flex items-center gap-1 text-[10px] font-bold"
                  >
                    <CalendarDays size={12} className="text-blue-700" />
                    Ngày khởi hành
                  </label>
                  <input
                    id="departure-date"
                    type="date"
                    min={getDefaultDate()}
                    value={departureDate}
                    onChange={(event) => {
                      setDepartureDate(event.target.value);
                      setTrips([]); setVehicleId(""); setTrip(null); setSeats(null);
                      setSelectedSeats([]); setPickupPointId(""); setDropoffPointId("");
                      clearError();
                    }}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="departure-time"
                    className="mb-1 flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Clock3 size={12} className="text-blue-700" />
                    Giờ khởi hành của chuyến đã chọn
                  </label>
                  <input
                    id="departure-time"
                    type="time"
                    value={departureTime}
                    readOnly
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="seat-count"
                    className="mb-1 block text-[10px] font-bold"
                  >
                    Số khách
                  </label>
                  <select
                    id="seat-count"
                    value={seatCount}
                    onChange={(event) => {
                      setSeatCount(Number(event.target.value));
                      setSelectedSeats([]);
                      clearError();
                    }}
                    className={inputClass}
                  >
                    {Array.from(
                      { length: Math.max(1, selectedVehicle.availableSeats) },
                      (_, index) => index + 1,
                    ).map((count) => (
                      <option key={count} value={count}>
                        {count} khách
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold">
                    Thời gian khởi hành
                  </label>
                  <div className={`${inputClass} flex items-center`}>
                    <Clock3 size={13} className="mr-2 shrink-0 text-blue-700" />
                    <span>{departure}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 03 - Chọn xe */}
            <section>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-extrabold">
                  <span className="rounded bg-blue-100 px-1.5 py-1 text-[10px] text-blue-700">
                    03
                  </span>
                  Chọn chuyến và xe GoRide
                </h2>
                <span className="text-[9px] font-bold text-emerald-700">
                  Giá tham khảo
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {vehicles.map((vehicle) => {
                  const selected = vehicle.id === vehicleId;

                  return (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => {
                        setVehicleId(vehicle.id);
                        const chosen = trips.find((option) => option.tripId === vehicle.id);
                        if (chosen) setDepartureTime(new Date(chosen.departureTime).toTimeString().slice(0, 5));
                        setTrip(null); setSeats(null); setSelectedSeats([]);
                        setPickupPointId(""); setDropoffPointId(""); setBookingTypeId("");
                        setSeatCount((current) =>
                          Math.min(current, vehicle.availableSeats),
                        );
                        clearError();
                      }}
                      className={`rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-blue-600 bg-[#f0f2ff] ring-1 ring-blue-200"
                          : "border-slate-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`rounded-lg p-2 ${
                            selected
                              ? "bg-blue-700 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <CarFront size={17} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold text-slate-900">
                            {vehicle.name}
                          </p>
                          <p className="flex items-center gap-1 text-[9px] text-slate-500">
                            <Users size={10} />
                            Tối đa {vehicle.seats} khách
                          </p>
                        </div>

                        {selected && (
                          <CheckCircle2
                            size={16}
                            className="shrink-0 fill-blue-700 text-blue-700"
                          />
                        )}
                      </div>

                      <p className="mt-2 min-h-[54px] text-[10px] leading-4 text-slate-600">
                        {vehicle.description}
                      </p>

                      <div className="mt-2 border-t border-slate-200 pt-2">
                        <p className="text-[9px] text-slate-500">
                          GIÁ THAM KHẢO / KHÁCH
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-sm font-extrabold text-blue-700">
                            {vehicle.price > 0 ? formatMoney(vehicle.price) : "Giá theo loại vé"}
                          </span>
                          <span className="rounded bg-emerald-100 px-1.5 py-1 text-[9px] font-bold text-emerald-700">
                            {vehicle.tag}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {routeId && displayTrips.length === 0 && <p className="mt-3 text-xs text-slate-500">
                Chưa có chuyến đang mở cho tuyến và ngày đã chọn.
              </p>}
              {displayTrips.length === 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {VEHICLE_TIERS.map((tier) => <div key={tier.seats} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <p className="font-extrabold text-slate-800">{tier.name} · {tier.tag}</p>
                  <p className="mt-1 leading-5 text-slate-600">{tier.description}</p>
                  <p className="mt-2 text-slate-500">Chọn tuyến và ngày đi để xem lịch xe, giá thực tế.</p>
                </div>)}
              </div>}
            </section>

            {trip && seats && <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
                <span className="rounded bg-blue-100 px-1.5 py-1 text-[10px] text-blue-700">04</span>
                Chọn ghế và loại vé
              </h2>
              <div className="rounded-xl bg-[#f0f2ff] p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold">Còn {seats.availableSeats}/{seats.totalSeats} ghế · Chọn {seatCount} ghế</p>
                  <button type="button" className="text-xs font-bold text-blue-700" onClick={async () => {
                    try {
                      const current = await bookingApi.seats(trip.tripId);
                      setSeats(current);
                      setSelectedSeats((previous) => previous.filter((seat) => !current.bookedSeats.includes(seat)));
                    } catch (cause) { setError(bookingErrorMessage(cause)); }
                  }}>Cập nhật chỗ trống</button>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {Array.from({ length: seats.totalSeats }, (_, index) => String(index + 1)).map((seat) => {
                    const booked = seats.bookedSeats.includes(seat);
                    const selected = selectedSeats.includes(seat);
                    return <button key={seat} type="button" disabled={booked} aria-pressed={selected}
                      aria-label={`Ghế ${seat}${booked ? " đã đặt" : ""}`}
                      onClick={() => {
                        if (!selected && selectedSeats.length >= seatCount) {
                          setError(`Chỉ chọn ${seatCount} ghế cho đơn này.`); return;
                        }
                        setSelectedSeats((previous) => selected ? previous.filter((item) => item !== seat) : [...previous, seat]);
                        clearError();
                      }}
                      className={`rounded-lg border px-2 py-2 text-xs font-bold ${booked ? "cursor-not-allowed bg-slate-200 text-slate-400" : selected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white hover:border-blue-400"}`}>
                      {seat}
                    </button>;
                  })}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {trip.fareOptions.map((option) => <button key={option.bookingTypeId} type="button"
                  disabled={option.farePerSeat === null} onClick={() => setBookingTypeId(option.bookingTypeId)}
                  className={`rounded-xl border p-3 text-left text-xs ${bookingTypeId === option.bookingTypeId ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}>
                  <span className="font-extrabold">{option.typeName}</span>
                  <span className="mt-1 block text-slate-500">{option.farePerSeat === null ? "Chưa có giá" : `${formatMoney(option.farePerSeat)}/ghế`}</span>
                </button>)}
              </div>
            </section>}

            {/* 04 - Liên hệ */}
            <section>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-extrabold">
                  <span className="rounded bg-blue-100 px-1.5 py-1 text-[10px] text-blue-700">
                    05
                  </span>
                  Thông tin liên hệ & ghi chú
                </h2>
                <span className="text-[9px] font-semibold text-emerald-700">
                  Dữ liệu bảo mật
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="customer-name"
                    className="mb-1 block text-[10px] font-semibold text-slate-700"
                  >
                    Họ và tên khách hàng
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(event) => {
                      setCustomerName(event.target.value);
                      clearError();
                    }}
                    placeholder="Nhập họ tên"
                    autoComplete="name"
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="customer-phone"
                    className="mb-1 block text-[10px] font-semibold text-slate-700"
                  >
                    Số điện thoại nhận tin tài xế
                  </label>

                  <div className="flex min-w-0 items-stretch gap-1.5">
                    <select
                      value={phonePrefix}
                      onChange={(event) => {
                        setPhonePrefix(event.target.value);
                        clearError();
                      }}
                      aria-label="Mã quốc gia"
                      className="h-10 w-[104px] shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-[#f0f2ff] px-2 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="+84">+84 (VN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+65">+65 (SG)</option>
                    </select>

                    <input
                      id="customer-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => {
                        setPhone(
                          event.target.value.replace(/\D/g, "").slice(0, 12),
                        );
                        clearError();
                      }}
                      placeholder="Nhập số điện thoại"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={12}
                      className="h-10 w-full min-w-0 flex-1 rounded-lg border border-slate-200 bg-[#f0f2ff] px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <p className="mt-1 text-[9px] leading-4 text-slate-500">
                    Chỉ nhập chữ số, không cần nhập mã quốc gia trong ô số điện thoại.
                  </p>
                </div>

                <div className="min-w-0 sm:col-span-2">
                  <label
                    htmlFor="booking-note"
                    className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-slate-700"
                  >
                    <MapPin size={11} />
                    Ghi chú cho tài xế (tùy chọn)
                  </label>
                  <textarea
                    id="booking-note"
                    rows={3}
                    value={note}
                    onChange={(event) => {
                      setNote(event.target.value);
                      clearError();
                    }}
                    placeholder="Ví dụ: Đón tại cổng B1 ga Quốc nội, có vali lớn, người già đi cùng..."
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>
            </section>

            {/* Nút thao tác */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={14} />
                Quay lại trang trước
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Đang xử lý..."
                  : "Kiểm tra giá cước & tiếp tục"}
                <ArrowRight size={15} />
              </button>
            </div>
          </section>

          {/* CỘT PHẢI */}
          <aside className="min-w-0 space-y-4">
            <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.07)] sm:p-5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h2 className="flex items-center gap-2 text-xs font-extrabold">
                  <span className="text-emerald-600">●</span>
                  ƯỚC TÍNH CƯỚC
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-700">
                  Giá tham khảo
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-[#f0f2ff] p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 p-2 text-blue-700">
                    <Navigation size={15} />
                  </span>
                  <div>
                    <p className="text-[9px] text-slate-500">
                      Khoảng cách & thời gian
                    </p>
                    <p className="text-sm font-extrabold text-slate-900">
                      Chưa tính toán
                    </p>
                  </div>
                </div>
                <span className="rounded bg-white px-2 py-1 text-[9px] font-bold text-slate-600">
                  Dự kiến
                </span>
              </div>

              <div className="my-4 space-y-3">
                <div className="flex min-w-0 gap-2">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-blue-600 bg-blue-100" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-500">Điểm đón</p>
                    <p className="break-words text-[10px] font-bold">
                      {pickup || "Chưa chọn"}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 gap-2">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-red-600 bg-red-100" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-500">Điểm đến</p>
                    <p className="break-words text-[10px] font-bold">
                      {destination || "Chưa chọn"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-[10px]">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Loại xe</span>
                  <b className="text-right">{selectedVehicle.name}</b>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Hình thức</span>
                  <b className="text-right">
                    {tripType === "one-way"
                      ? "Một chiều"
                      : tripType === "round-trip"
                        ? "Khứ hồi"
                        : "Theo giờ"}
                  </b>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Số khách</span>
                  <b>{seatCount}</b>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">
                    Giá tham khảo / khách
                  </span>
                  <b>{selectedFare?.farePerSeat == null ? "Chưa có giá" : formatMoney(selectedFare.farePerSeat)}</b>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Khởi hành</span>
                  <b className="text-right">{departure}</b>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#f0f2ff] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500">
                      TỔNG GIÁ THAM KHẢO
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Chưa phải giá chốt từ backend
                    </p>
                  </div>
                  <span className="text-xl font-extrabold tracking-tight text-blue-700 sm:text-2xl">
                    {selectedFare?.farePerSeat == null ? "Chưa có giá" : formatMoney(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="relative mt-4 h-28 overflow-hidden rounded-lg bg-[#e9edff]">
                <svg
                  viewBox="0 0 400 120"
                  className="h-full w-full"
                  role="img"
                  aria-label="Sơ đồ minh họa lộ trình"
                >
                  <g stroke="#d3dcff" strokeWidth="5">
                    <path d="M0 25H400 M0 60H400 M0 95H400" />
                    <path d="M45 0V120 M105 0V120 M165 0V120 M225 0V120 M285 0V120 M345 0V120" />
                  </g>
                  <path
                    d="M20 85 C90 20, 120 105, 190 80 S290 25, 380 45"
                    fill="none"
                    stroke="#b8e4ff"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M75 35 C125 45, 160 100, 225 85 S290 25, 330 35"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="75"
                    cy="35"
                    r="10"
                    fill="#dbeafe"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                  <circle cx="75" cy="35" r="4" fill="#2563eb" />
                  <circle
                    cx="330"
                    cy="35"
                    r="10"
                    fill="#fee2e2"
                    stroke="#dc2626"
                    strokeWidth="2"
                  />
                  <circle cx="330" cy="35" r="4" fill="#dc2626" />
                </svg>

                <div className="absolute bottom-2 left-2 max-w-[95%] truncate rounded bg-white/90 px-2 py-1 text-[9px] font-semibold text-slate-600">
                  <MapPin size={10} className="mr-1 inline" />
                  {pickup.split(",")[0] || "Điểm đón"} →{" "}
                  {destination.split(",")[0] || "Điểm đến"}
                </div>
              </div>

              <div className="mt-3 flex gap-2 rounded-lg bg-[#d9f0e8] p-3">
                <ShieldCheck size={15} className="shrink-0 text-emerald-700" />
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-800">
                    Thông tin minh bạch
                  </p>
                  <p className="text-[9px] leading-4 text-slate-600">
                    Giá trên trang là giá tham khảo. Backend cần xác nhận
                    giá cuối cùng trước khi chuyến đi được tạo.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.07)] sm:p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold">
                <Info size={15} className="text-blue-700" />
                Câu hỏi thường gặp
              </h2>

              {[
                {
                  question: "Làm thế nào để thay đổi điểm đón?",
                  answer:
                    "Bạn có thể nhập địa chỉ mới hoặc chọn vị trí khác trên bản đồ trước khi gửi yêu cầu đặt xe.",
                },
                {
                  question: "Chính sách hủy chuyến của GoRide?",
                  answer:
                    "Chính sách hủy chuyến được áp dụng theo điều kiện hiển thị khi xác nhận và quy định của dịch vụ.",
                },
              ].map((faq, index) => (
                <div
                  key={faq.question}
                  className="mb-2 overflow-hidden rounded-lg bg-[#f0f2ff] last:mb-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setFaqOpen(faqOpen === index ? -1 : index)
                    }
                    className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-[10px] font-extrabold"
                  >
                    {faq.question}
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition ${
                        faqOpen === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {faqOpen === index && (
                    <p className="px-3 pb-3 text-[10px] leading-5 text-slate-600">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
