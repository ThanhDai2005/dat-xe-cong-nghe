import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Calendar,
  Car,
  Clock,
  Compass,
  MapPin,
  ShieldCheck,
  Users,
  AlertCircle,
  ArrowRight,
  Phone,
  User,
  FileText,
} from "lucide-react";
import {
  customerApi,
  type RouteSearchResult,
  type TripSearchResult,
  type TripDetailResult,
  type TripSeatsResult,
} from "@/services/customer.service";
import { useAuth } from "@/hooks/useAuth";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Search filters
  const [routes, setRoutes] = useState<RouteSearchResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState(searchParams.get("routeId") || "");
  const [searchDate, setSearchDate] = useState(
    searchParams.get("date") || new Date().toISOString().slice(0, 10)
  );
  const [seatCount, setSeatCount] = useState(Number(searchParams.get("seats") || 1));

  // Trips data
  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripSearchResult | null>(null);
  const [tripDetail, setTripDetail] = useState<TripDetailResult | null>(null);
  const [seatsData, setSeatsData] = useState<TripSeatsResult | null>(null);

  // Booking selections
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPickup, setSelectedPickup] = useState("");
  const [selectedDropoff, setSelectedDropoff] = useState("");
  const [customerName, setCustomerName] = useState(user?.fullName || "");
  const [contactPhone, setContactPhone] = useState(user?.email?.startsWith("0") ? user.email : "");
  const [driverNote, setDriverNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [error, setError] = useState("");

  // 1. Tải danh sách tuyến đường
  useEffect(() => {
    customerApi
      .searchRoutes()
      .then((res) => {
        if (res.data) setRoutes(res.data);
      })
      .catch(() => {});
  }, []);

  // 2. Tìm kiếm chuyến xe khi thay đổi tuyến hoặc ngày
  useEffect(() => {
    setLoading(true);
    setError("");
    customerApi
      .searchTrips(selectedRouteId, searchDate, seatCount)
      .then((res) => {
        setTrips(res.data || []);
        if (res.data?.length > 0 && !selectedTrip) {
          // Tự động chọn chuyến đầu tiên
          handleSelectTrip(res.data[0]);
        }
      })
      .catch((err) => {
        setError(err.message || "Không thể tải danh sách chuyến xe");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedRouteId, searchDate, seatCount]);

  // 3. Khi chọn chuyến xe -> Tải chi tiết điểm đón/trả và sơ đồ ghế
  const handleSelectTrip = async (trip: TripSearchResult) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    try {
      const [detailRes, seatsRes] = await Promise.all([
        customerApi.getTripDetail(trip.tripId),
        customerApi.getTripSeats(trip.tripId),
      ]);
      setTripDetail(detailRes.data);
      setSeatsData(seatsRes.data);

      if (detailRes.data.pickupPoints?.length > 0) {
        setSelectedPickup(detailRes.data.pickupPoints[0].stopId);
      }
      if (detailRes.data.dropoffPoints?.length > 0) {
        setSelectedDropoff(detailRes.data.dropoffPoints[0].stopId);
      }
    } catch {
      setError("Không thể tải sơ đồ ghế cho chuyến xe này");
    }
  };

  // 4. Toggle chọn ghế
  const toggleSeat = (seatNo: string, isBooked: boolean) => {
    if (isBooked) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNo) ? prev.filter((s) => s !== seatNo) : [...prev, seatNo]
    );
  };

  // 5. Tiến hành đặt vé
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) {
      setError("Vui lòng chọn một chuyến xe");
      return;
    }
    if (selectedSeats.length === 0) {
      setError("Vui lòng chọn ít nhất một ghế ngồi trên sơ đồ");
      return;
    }
    if (!customerName.trim() || !contactPhone.trim()) {
      setError("Vui lòng nhập đầy đủ tên và số điện thoại liên hệ");
      return;
    }

    setBookingBusy(true);
    setError("");

    try {
      const res = await customerApi.createBooking({
        tripId: selectedTrip.tripId,
        seatNumbers: selectedSeats,
        pickupPointId: selectedPickup || undefined,
        dropoffPointId: selectedDropoff || undefined,
        customerName: customerName.trim(),
        contactPhone: contactPhone.trim(),
        driverNote: driverNote.trim(),
      });

      if (res.data?.bookingId) {
        // Điều hướng sang trang xác nhận thanh toán kèm dữ liệu
        navigate("/booking/confirm", {
          state: {
            booking: res.data,
            trip: selectedTrip,
            tripDetail,
            customerName: customerName.trim(),
            contactPhone: contactPhone.trim(),
            selectedSeats,
          },
        });
      }
    } catch (err: any) {
      setError(err?.message || "Đặt vé thất bại, vui lòng thử lại sau.");
    } finally {
      setBookingBusy(false);
    }
  };

  const totalPrice = selectedTrip ? selectedTrip.price * (selectedSeats.length || 1) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0050c8] mb-2">
            <Compass className="w-4 h-4" />
            Hệ thống đặt xe công nghệ & Tuyến cố định
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Đặt Chuyến Xe Trực Tuyến
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chọn chuyến xe, giữ chỗ tức thì và nhận vé xác nhận điện tử minh bạch 100%.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0050c8]" /> Tuyến đường
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050c8]"
              >
                <option value="">Tất cả các tuyến đường</option>
                {routes.map((r) => (
                  <option key={r.routeId} value={r.routeId}>
                    {r.origin} → {r.destination} ({r.distance} km)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0050c8]" /> Ngày khởi hành
              </label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050c8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0050c8]" /> Số lượng khách
              </label>
              <select
                value={seatCount}
                onChange={(e) => setSeatCount(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050c8]"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    {num} hành khách
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setSelectedRouteId(selectedRouteId)}
                className="w-full h-11 bg-[#0050c8] hover:bg-[#0040a2] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4" />
                Tìm kiếm chuyến
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Danh sách các chuyến xe khả dụng */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0050c8]" />
                Các chuyến xe khả dụng ({trips.length})
              </h2>
              {loading && <span className="text-xs text-slate-400 animate-pulse">Đang tìm...</span>}
            </div>

            {trips.length === 0 && !loading && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Chưa tìm thấy chuyến phù hợp</p>
                <p className="text-xs text-slate-500 mt-1">
                  Vui lòng chọn ngày khác hoặc thử chọn tuyến đường khác.
                </p>
              </div>
            )}

            {trips.map((trip) => {
              const isSelected = selectedTrip?.tripId === trip.tripId;
              const depDate = new Date(trip.departureTime);

              return (
                <div
                  key={trip.tripId}
                  onClick={() => handleSelectTrip(trip)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-blue-50/70 border-[#0050c8] shadow-md shadow-blue-500/10"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#0050c8] mb-1.5">
                        {trip.vehicleTypeName} • Biển {trip.licensePlate}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{trip.routeName}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-[#0050c8]">
                        {formatPrice(trip.price)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">/ ghế</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {depDate.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {depDate.toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-emerald-600">
                        Còn {trip.availableSeats} chỗ trống
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cột phải: Sơ đồ ghế & Điểm đón trả & Form thông tin */}
          <div className="lg:col-span-7">
            {selectedTrip ? (
              <form onSubmit={handleCreateBooking} className="space-y-6">
                {/* Seat Map Picker */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Sơ đồ chỗ ngồi ({selectedTrip.vehicleTypeName})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Vui lòng nhấp chọn ghế ngồi mong muốn của bạn trên xe.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-white border-2 border-slate-300" />
                        Trống
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-[#0050c8]" />
                        Đang chọn
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-slate-300" />
                        Đã đặt
                      </span>
                    </div>
                  </div>

                  {/* Seat Grid Box */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 max-w-sm mx-auto">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-dashed border-slate-200 text-xs font-bold text-slate-400">
                      <span>ĐẦU XE</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                        Vô lăng tài xế
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {seatsData?.seatMap?.map((seat) => {
                        const isSelected = selectedSeats.includes(seat.seatNumber);
                        const isBooked = seat.isBooked;

                        return (
                          <button
                            key={seat.seatNumber}
                            type="button"
                            disabled={isBooked}
                            onClick={() => toggleSeat(seat.seatNumber, isBooked)}
                            className={`h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                              isBooked
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed line-through"
                                : isSelected
                                ? "bg-[#0050c8] text-white shadow-md shadow-blue-500/30 scale-105"
                                : "bg-white text-slate-700 border-2 border-slate-200 hover:border-[#0050c8] hover:text-[#0050c8]"
                            }`}
                          >
                            Ghế {seat.seatNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedSeats.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-blue-50 text-[#0050c8] text-xs font-semibold flex items-center justify-between">
                      <span>
                        Đã chọn <strong>{selectedSeats.length}</strong> ghế:{" "}
                        {selectedSeats.map((s) => `Ghế ${s}`).join(", ")}
                      </span>
                      <span className="text-sm font-black">{formatPrice(totalPrice)}</span>
                    </div>
                  )}
                </div>

                {/* Pickup & Dropoff Stops */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                    Điểm đón & Trả khách
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Điểm đón
                      </label>
                      <select
                        value={selectedPickup}
                        onChange={(e) => setSelectedPickup(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                      >
                        {tripDetail?.pickupPoints?.map((p) => (
                          <option key={p.stopId} value={p.stopId}>
                            {p.stopName} ({p.address})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> Điểm trả
                      </label>
                      <select
                        value={selectedDropoff}
                        onChange={(e) => setSelectedDropoff(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                      >
                        {tripDetail?.dropoffPoints?.map((p) => (
                          <option key={p.stopId} value={p.stopId}>
                            {p.stopName} ({p.address})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Passenger Information */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                    Thông tin hành khách liên hệ
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#0050c8]" /> Họ và tên khách hàng *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#0050c8]" /> Số điện thoại đón xe *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912345678"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> Ghi chú cho tài xế (Tùy
                      chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Có mang hành lý lớn, xin đón đúng giờ..."
                      value={driverNote}
                      onChange={(e) => setDriverNote(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800"
                    />
                  </div>
                </div>

                {/* Submit Action Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Tổng thanh toán dự tính:</span>
                    <span className="text-2xl font-black text-[#0050c8]">
                      {formatPrice(totalPrice)}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      ({selectedSeats.length || 1} ghế ngồi • Giữ chỗ trong 15 phút)
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingBusy || selectedSeats.length === 0}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#0050c8] hover:bg-[#0040a2] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {bookingBusy ? (
                      "Đang khởi tạo đơn..."
                    ) : (
                      <>
                        Tiếp tục thanh toán
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Chọn một chuyến xe ở bên trái</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Sơ đồ chỗ ngồi, điểm đón trả và thông tin chuyến sẽ xuất hiện tại đây để bạn đặt vé.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
