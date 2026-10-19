
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  ArrowRight,
  ArrowUpDown,
  CalendarDays,
  Clock3,
  Users,
  CarFront,
  ShieldCheck,
  CheckCircle2,
  CircleAlert,
  TicketCheck,
  Coins,
} from "lucide-react";

import {
  ROUTES,
  createDemoTrips,
  formatMoney,
  formatDateTime,
} from "./bookingCardData";

import type {
  RouteOption,
  Trip,
} from "./bookingCardData";

import { isAuthenticated } from "@/services/auth.service";

export default function BookingCard() {
  const navigate = useNavigate();

  const [routeId, setRouteId] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [seatCount, setSeatCount] = useState(1);

  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Tuyến đang được chọn
  const selectedRoute: RouteOption | undefined = useMemo(
    () => ROUTES.find((route) => route.id === routeId),
    [routeId],
  );

  // Tạo danh sách chuyến theo tuyến đã chọn
  const trips: Trip[] = useMemo(() => {
    if (!selectedRoute) return [];
    return createDemoTrips(selectedRoute);
  }, [selectedRoute]);

  // Chỉ hiển thị chuyến còn đủ ghế
  const availableTrips = useMemo(
    () =>
      trips.filter((trip) => trip.availableSeats >= seatCount),
    [trips, seatCount],
  );

  const selectedTrip = useMemo(
    () => availableTrips.find((trip) => trip.id === selectedTripId),
    [availableTrips, selectedTripId],
  );

  // Tính tiền và điểm dựa trên dữ liệu tuyến hiện có
  const totalPrice = selectedTrip
    ? selectedTrip.pricePerSeat * seatCount
    : 0;

  const totalPoints = selectedTrip
    ? selectedTrip.points * seatCount
    : 0;

  const handleRouteChange = (value: string) => {
    setRouteId(value);
    setSelectedTripId("");
    setSearchPerformed(false);
    setError("");
    setNotice("");
  };

  const handleSwapLocations = () => {
    setPickup(destination);
    setDestination(pickup);
    setError("");
    setNotice("");
  };

  const handleSearchTrips = () => {
    setError("");
    setNotice("");
    setSelectedTripId("");
    setSearchPerformed(false);

    if (!selectedRoute) {
      setError("Vui lòng chọn tuyến đường.");
      return;
    }

    if (!pickup.trim()) {
      setError("Vui lòng nhập điểm đón.");
      return;
    }

    if (!destination.trim()) {
      setError("Vui lòng nhập điểm đến.");
      return;
    }

    if (
      pickup.trim().toLocaleLowerCase("vi") ===
      destination.trim().toLocaleLowerCase("vi")
    ) {
      setError("Điểm đón và điểm đến không được trùng nhau.");
      return;
    }

    if (!Number.isInteger(seatCount) || seatCount < 1) {
      setError("Số ghế phải lớn hơn hoặc bằng 1.");
      return;
    }

    setSearchPerformed(true);

    if (availableTrips.length === 0) {
      setNotice("Hiện chưa có chuyến phù hợp với số ghế đã chọn.");
    }
  };

  const handleContinue = () => {
    setError("");
    setNotice("");

    if (!selectedRoute) {
      setError("Vui lòng chọn tuyến đường.");
      return;
    }

    if (!pickup.trim()) {
      setError("Vui lòng nhập điểm đón.");
      return;
    }

    if (!destination.trim()) {
      setError("Vui lòng nhập điểm đến.");
      return;
    }

    if (
      pickup.trim().toLocaleLowerCase("vi") ===
      destination.trim().toLocaleLowerCase("vi")
    ) {
      setError("Điểm đón và điểm đến không được trùng nhau.");
      return;
    }

    if (!selectedTrip) {
      setError("Vui lòng chọn một chuyến xe trước khi tiếp tục.");
      return;
    }

    if (
      !Number.isInteger(seatCount) ||
      seatCount < 1 ||
      seatCount > selectedTrip.availableSeats
    ) {
      setError("Số ghế đã chọn không hợp lệ.");
      return;
    }

    // Lưu toàn bộ thông tin chuyến xe trên URL để khôi phục
    // sau khi người dùng đăng nhập thành công.
    const params = new URLSearchParams({
      route: selectedRoute.id,
      routeName: selectedRoute.name,
      tripId: selectedTrip.id,
      tripType: "merge",
      seats: String(seatCount),
      availableSeats: String(selectedTrip.availableSeats),
      pickup: pickup.trim(),
      destination: destination.trim(),
      departureAt: selectedTrip.departureAt,
      price: String(totalPrice),
      points: String(totalPoints),
      vehicle: selectedTrip.vehicle,
      source: "demo",
    });

    const bookingUrl = `/booking?${params.toString()}`;

    if (isAuthenticated()) {
      navigate(bookingUrl);
      return;
    }

    navigate(`/login?redirect=${encodeURIComponent(bookingUrl)}`);
  };

  return (
    <section
      id="booking"
      className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-900/5">
        {/* Tiêu đề */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 via-white to-emerald-50 px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">
                <CarFront size={15} />
                ĐẶT XE GORIDE
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Bạn muốn đi đâu?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Chọn tuyến, nhập thông tin hành trình và tìm chuyến xe phù hợp.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-green-100 bg-white px-4 py-3 sm:self-center">
              <ShieldCheck className="shrink-0 text-green-600" size={22} />
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Đặt xe dễ dàng
                </p>
                <p className="text-xs text-gray-500">
                  Thông tin rõ ràng
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {/* Thông báo lỗi */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <CircleAlert size={19} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Thông báo */}
          {notice && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              <CircleAlert size={19} className="mt-0.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Form tìm chuyến */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Chọn tuyến */}
            <div className="lg:col-span-2">
              <label
                htmlFor="booking-route"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Tuyến đường
              </label>

              <select
                id="booking-route"
                value={routeId}
                onChange={(event) => handleRouteChange(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
              >
                <option value="">-- Chọn tuyến đường --</option>

                {ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>

              {selectedRoute?.note && (
                <p className="mt-2 text-xs leading-5 text-amber-700">
                  Lưu ý: {selectedRoute.note}
                </p>
              )}
            </div>

            {/* Điểm đón */}
            <div>
              <label
                htmlFor="booking-pickup"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Điểm đón
              </label>

              <div className="relative">
                <MapPin
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                />

                <input
                  id="booking-pickup"
                  type="text"
                  value={pickup}
                  onChange={(event) => {
                    setPickup(event.target.value);
                    setError("");
                  }}
                  placeholder="Nhập địa chỉ đón khách"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                />
              </div>
            </div>

            {/* Điểm đến */}
            <div>
              <label
                htmlFor="booking-destination"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Điểm đến
              </label>

              <div className="relative">
                <MapPin
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                />

                <input
                  id="booking-destination"
                  type="text"
                  value={destination}
                  onChange={(event) => {
                    setDestination(event.target.value);
                    setError("");
                  }}
                  placeholder="Nhập địa chỉ đến"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={handleSwapLocations}
                  title="Đổi điểm đón và điểm đến"
                  aria-label="Đổi điểm đón và điểm đến"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm transition hover:bg-green-50 hover:text-green-700"
                >
                  <ArrowUpDown size={16} />
                </button>
              </div>
            </div>

            {/* Số ghế */}
            <div>
              <label
                htmlFor="booking-seats"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Số ghế
              </label>

              <div className="relative">
                <Users
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                />

                <select
                  id="booking-seats"
                  value={seatCount}
                  onChange={(event) => {
                    setSeatCount(Number(event.target.value));
                    setSelectedTripId("");
                    setSearchPerformed(false);
                    setError("");
                    setNotice("");
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                >
                  {[1, 2, 3, 4].map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "ghế" : "ghế"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Thông tin tuyến */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <TicketCheck size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800">
                  Giá vé theo tuyến
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedRoute
                    ? `${formatMoney(selectedRoute.pricePerSeat)} / ghế`
                    : "Chọn tuyến để xem giá vé"}
                </p>
              </div>
            </div>

            {/* Nút tìm chuyến */}
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={handleSearchTrips}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
              >
                <MapPin size={19} />
                Tìm chuyến xe
                <ArrowRight size={19} />
              </button>
            </div>
          </div>

          {/* Danh sách chuyến */}
          {searchPerformed && (
            <div className="mt-8 border-t border-gray-100 pt-8">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Chuyến xe phù hợp
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedRoute?.name}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                  {availableTrips.length} chuyến khả dụng
                </span>
              </div>

              {availableTrips.length > 0 ? (
                <div className="space-y-4">
                  {availableTrips.map((trip) => {
                    const isSelected = selectedTripId === trip.id;
                    const tripTotal = trip.pricePerSeat * seatCount;

                    return (
                      <button
                        key={trip.id}
                        type="button"
                        onClick={() => {
                          setSelectedTripId(trip.id);
                          setError("");
                          setNotice("");
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition sm:p-5 ${
                          isSelected
                            ? "border-green-500 bg-green-50/70 ring-2 ring-green-100"
                            : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/30"
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                                isSelected
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <CarFront size={24} />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-bold text-gray-900">
                                  {trip.vehicle}
                                </p>

                                {isSelected && (
                                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                                    Đã chọn
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <CalendarDays
                                  size={16}
                                  className="shrink-0 text-green-600"
                                />
                                {formatDateTime(trip.departureAt)}
                              </p>

                              <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                <Users
                                  size={16}
                                  className="shrink-0"
                                />
                                Còn {trip.availableSeats} ghế
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:block sm:border-0 sm:pt-0 sm:text-right">
                            <div>
                              <p className="text-lg font-extrabold text-green-700">
                                {formatMoney(tripTotal)}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {formatMoney(trip.pricePerSeat)} / ghế
                              </p>
                            </div>

                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                isSelected
                                  ? "border-green-600 bg-green-600 text-white"
                                  : "border-gray-300 text-transparent"
                              }`}
                            >
                              <CheckCircle2 size={17} />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                  <Clock3
                    size={34}
                    className="mx-auto text-gray-400"
                  />
                  <p className="mt-3 font-bold text-gray-800">
                    Chưa tìm thấy chuyến xe phù hợp
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Hãy thử giảm số ghế hoặc kiểm tra lại tuyến đã chọn.
                  </p>
                </div>
              )}

              {/* Tổng kết và tiếp tục */}
              {selectedTrip && (
                <div className="mt-6 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-5 sm:p-6">
                  <h4 className="text-lg font-extrabold text-gray-900">
                    Thông tin đặt xe
                  </h4>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-gray-500">Tuyến đường</span>
                      <span className="max-w-[65%] text-right font-semibold text-gray-800">
                        {selectedRoute?.name}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-gray-500">Điểm đón</span>
                      <span className="max-w-[65%] text-right font-semibold text-gray-800">
                        {pickup.trim()}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-gray-500">Điểm đến</span>
                      <span className="max-w-[65%] text-right font-semibold text-gray-800">
                        {destination.trim()}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-gray-500">Thời gian</span>
                      <span className="max-w-[65%] text-right font-semibold text-gray-800">
                        {formatDateTime(selectedTrip.departureAt)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-gray-500">Số ghế</span>
                      <span className="font-semibold text-gray-800">
                        {seatCount} ghế
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-green-100 pt-4">
                      <span className="font-bold text-gray-700">
                        Tổng tiền dự kiến
                      </span>
                      <span className="text-2xl font-extrabold text-green-700">
                        {formatMoney(totalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2 text-gray-500">
                        <Coins size={16} />
                        Điểm dự kiến
                      </span>
                      <span className="font-bold text-green-700">
                        {totalPoints.toLocaleString("vi-VN")} điểm
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
                  >
                    Tiếp tục đặt xe
                    <ArrowRight size={19} />
                  </button>

                  <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                    Bạn sẽ được yêu cầu đăng nhập nếu chưa có phiên đăng nhập.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
