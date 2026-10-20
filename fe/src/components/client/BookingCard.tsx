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
  MapPinned,
} from "lucide-react";

import {
  ROUTES,
  createDemoTrips,
  formatMoney,
  formatDateTime,
} from "./bookingCardData";

import type { RouteOption, Trip } from "./bookingCardData";

import { isAuthenticated } from "@/services/auth.service";
import GoogleMapLocationPicker from "@/components/client/GoogleMapLocationPicker";

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

  const selectedRoute: RouteOption | undefined = useMemo(
    () => ROUTES.find((route) => route.id === routeId),
    [routeId],
  );

  const trips: Trip[] = useMemo(() => {
    if (!selectedRoute) return [];
    return createDemoTrips(selectedRoute);
  }, [selectedRoute]);

  const availableTrips = useMemo(
    () => trips.filter((trip) => trip.availableSeats >= seatCount),
    [trips, seatCount],
  );

  const selectedTrip = useMemo(
    () => availableTrips.find((trip) => trip.id === selectedTripId),
    [availableTrips, selectedTripId],
  );

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
    setSelectedTripId("");
    setSearchPerformed(false);
    setError("");
    setNotice("");
  };

  const validateLocations = (): boolean => {
    if (!selectedRoute) {
      setError("Vui lòng chọn tuyến đường.");
      return false;
    }

    if (!pickup.trim()) {
      setError("Vui lòng chọn điểm đón trên Google Maps.");
      return false;
    }

    if (!destination.trim()) {
      setError("Vui lòng chọn điểm đến trên Google Maps.");
      return false;
    }

    if (
      pickup.trim().toLocaleLowerCase("vi") ===
      destination.trim().toLocaleLowerCase("vi")
    ) {
      setError("Điểm đón và điểm đến không được trùng nhau.");
      return false;
    }

    if (!Number.isInteger(seatCount) || seatCount < 1) {
      setError("Số ghế phải lớn hơn hoặc bằng 1.");
      return false;
    }

    return true;
  };

  const handleSearchTrips = () => {
    setError("");
    setNotice("");
    setSelectedTripId("");
    setSearchPerformed(false);

    if (!validateLocations()) return;

    setSearchPerformed(true);

    if (availableTrips.length === 0) {
      setNotice("Hiện chưa có chuyến phù hợp với số ghế đã chọn.");
    }
  };

  const handleContinue = () => {
    setError("");
    setNotice("");

    if (!validateLocations()) return;

    if (!selectedTrip || !selectedRoute) {
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

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

  return (
    <section id="booking" className="relative z-10 w-full min-w-0">
      <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.10)] sm:rounded-3xl">
        {/* Tiêu đề */}
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-blue-700">
                <CarFront size={14} />
                ĐẶT CHUYẾN NGAY
              </span>

              <h2 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-2xl">
                Bạn muốn đi đâu?
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm">
                Nhập thông tin hành trình của bạn.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-2.5">
              <ShieldCheck size={19} className="text-blue-600" />
              <span className="mt-1 text-[11px] font-bold text-slate-800">
                An toàn
              </span>
              <span className="text-[10px] text-slate-500">GoRide</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* Thông báo lỗi */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <CircleAlert size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
              <CircleAlert size={17} className="mt-0.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Tuyến đường */}
          <div className="min-w-0">
            <label
              htmlFor="booking-route"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Tuyến đường
            </label>

            <select
              id="booking-route"
              value={routeId}
              onChange={(event) => handleRouteChange(event.target.value)}
              className={inputClass}
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
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-4">
            <GoogleMapLocationPicker
              label="Điểm đón"
              value={pickup}
              placeholder="Nhấn để chọn điểm đón trên Google Maps"
              onChange={(address: string) => {
                setPickup(address);
                setError("");
                setNotice("");
                setSelectedTripId("");
                setSearchPerformed(false);
              }}
              markerColor="#2563eb"
            />

            <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-slate-500">
              <MapPinned size={14} className="shrink-0 text-blue-600" />
              Nhấn vào ô để chọn vị trí đón khách.
            </p>
          </div>

          {/* Điểm đến */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-4">
            <GoogleMapLocationPicker
              label="Điểm đến"
              value={destination}
              placeholder="Nhấn để chọn điểm đến trên Google Maps"
              onChange={(address: string) => {
                setDestination(address);
                setError("");
                setNotice("");
                setSelectedTripId("");
                setSearchPerformed(false);
              }}
              markerColor="#ef4444"
            />

            <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-slate-500">
              <MapPinned size={14} className="shrink-0 text-red-500" />
              Nhấn vào ô để chọn vị trí đến.
            </p>
          </div>

          {/* Đổi điểm */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwapLocations}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
              title="Đổi điểm đón và điểm đến"
            >
              <ArrowUpDown size={16} />
              Đổi điểm đón và điểm đến
            </button>
          </div>

          {/* Số ghế */}
          <div>
            <label
              htmlFor="booking-seats"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"
            >
              <Users
                size={17}
                className="shrink-0 text-emerald-600"
              />
              <span>Số ghế</span>
            </label>

            <div className="relative">
              <Users
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-emerald-600"
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
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                {[1, 2, 3, 4].map((count) => (
                  <option key={count} value={count}>
                    {count} ghế
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Giá vé */}
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-3.5 sm:p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <TicketCheck size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">
                Giá vé theo tuyến
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedRoute
                  ? `${formatMoney(selectedRoute.pricePerSeat)} / ghế`
                  : "Chọn tuyến để xem giá vé"}
              </p>
            </div>
          </div>

          {/* Tìm chuyến */}
          <button
            type="button"
            onClick={handleSearchTrips}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 active:translate-y-0"
          >
            <MapPin size={17} />
            Tìm chuyến xe
            <ArrowRight size={17} />
          </button>

          {/* Danh sách chuyến */}
          {searchPerformed && (
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Chuyến xe phù hợp
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedRoute?.name}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  {availableTrips.length} chuyến khả dụng
                </span>
              </div>

              {availableTrips.length > 0 ? (
                <div className="space-y-3">
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
                        className={`w-full rounded-xl border p-3.5 text-left transition duration-200 hover:shadow-md sm:p-4 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <CarFront size={21} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-slate-900">
                                {trip.vehicle}
                              </p>

                              {isSelected && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                  Đã chọn
                                </span>
                              )}
                            </div>

                            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                              <CalendarDays
                                size={14}
                                className="shrink-0 text-blue-600"
                              />
                              {formatDateTime(trip.departureAt)}
                            </p>

                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                              <Users size={14} className="shrink-0" />
                              Còn {trip.availableSeats} ghế
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-extrabold text-blue-700 sm:text-base">
                              {formatMoney(tripTotal)}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-500">
                              {formatMoney(trip.pricePerSeat)} / ghế
                            </p>

                            <div
                              className={`ml-auto mt-2 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 text-transparent"
                              }`}
                            >
                              <CheckCircle2 size={14} />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                  <Clock3 size={30} className="mx-auto text-slate-400" />
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    Chưa tìm thấy chuyến xe phù hợp
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Hãy thử giảm số ghế hoặc kiểm tra lại tuyến đã chọn.
                  </p>
                </div>
              )}

              {/* Tổng kết chuyến */}
              {selectedTrip && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
                  <h4 className="text-base font-extrabold text-slate-900">
                    Thông tin đặt xe
                  </h4>

                  <div className="mt-4 space-y-3">
                    {[
                      ["Tuyến đường", selectedRoute?.name ?? ""],
                      ["Điểm đón", pickup.trim()],
                      ["Điểm đến", destination.trim()],
                      ["Thời gian", formatDateTime(selectedTrip.departureAt)],
                      ["Số ghế", `${seatCount} ghế`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <span className="shrink-0 text-slate-500">
                          {label}
                        </span>
                        <span className="max-w-[65%] break-words text-right font-semibold text-slate-800">
                          {value}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between gap-3 border-t border-blue-100 pt-3">
                      <span className="text-sm font-bold text-slate-700">
                        Tổng tiền dự kiến
                      </span>
                      <span className="text-xl font-extrabold text-blue-700">
                        {formatMoney(totalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Coins size={15} />
                        Điểm dự kiến
                      </span>
                      <span className="font-bold text-blue-700">
                        {totalPoints.toLocaleString("vi-VN")} điểm
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 active:translate-y-0"
                  >
                    Tiếp tục đặt xe
                    <ArrowRight size={17} />
                  </button>

                  <p className="mt-3 text-center text-xs leading-5 text-slate-500">
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
