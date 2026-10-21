import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  Car,
  Clock,
  Compass,
  MapPin,
  Users,
  ArrowRight,
  Search,
} from "lucide-react";
import {
  customerApi,
  type TripSearchResult,
  type RouteSearchResult,
} from "@/services/customer.service";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

export default function TripPage() {
  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [routes, setRoutes] = useState<RouteSearchResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerApi.searchRoutes().then((res) => {
      if (res.data) setRoutes(res.data);
    });
  }, []);

  const loadTrips = () => {
    setLoading(true);
    customerApi
      .searchTrips(selectedRouteId, selectedDate)
      .then((res) => {
        setTrips(res.data || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTrips();
  }, [selectedRouteId, selectedDate]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0050c8] mb-1.5">
            <Compass className="w-4 h-4" />
            Lịch Trình Vận Hành Toàn Quốc
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Danh Sách Các Chuyến Xe Khả Dụng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tra cứu giờ xuất bến, loại xe, tình trạng chỗ trống và giá vé niêm yết minh bạch.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0050c8]" /> Tuyến đường
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800"
            >
              <option value="">Tất cả các tuyến đường</option>
              {routes.map((r) => (
                <option key={r.routeId} value={r.routeId}>
                  {r.origin} → {r.destination}
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
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadTrips}
              className="w-full h-11 bg-[#0050c8] hover:bg-[#0040a2] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Lọc chuyến xe
            </button>
          </div>
        </div>

        {/* Trips Grid */}
        {loading && (
          <div className="p-12 text-center text-sm text-slate-500">Đang tìm các chuyến xe...</div>
        )}

        {!loading && trips.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Không có chuyến xe nào</h3>
            <p className="text-xs text-slate-500 mt-1">Vui lòng thử chọn tuyến đường hoặc ngày khác.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {trips.map((trip) => {
            const depDate = new Date(trip.departureTime);
            return (
              <div
                key={trip.tripId}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:border-[#0050c8]/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#0050c8]">
                      {trip.vehicleTypeName} • Biển {trip.licensePlate}
                    </span>
                    <span className="text-xl font-black text-[#0050c8]">
                      {formatPrice(trip.price)}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-2">{trip.routeName}</h3>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Giờ khởi hành:{" "}
                        <strong className="text-slate-800">
                          {depDate.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </strong>{" "}
                        ngày{" "}
                        {depDate.toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Chỗ trống:{" "}
                        <strong className="text-emerald-600">
                          {trip.availableSeats} / {trip.totalSeats} ghế
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/trip/${trip.tripId}`}
                    className="text-xs font-bold text-slate-600 hover:text-[#0050c8]"
                  >
                    Chi tiết điểm đón/trả →
                  </Link>
                  <Link
                    to={`/booking?routeId=${encodeURIComponent(selectedRouteId || "")}`}
                    className="px-4 py-2 rounded-xl bg-[#0050c8] hover:bg-[#0040a2] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    Đặt vé ngay
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
