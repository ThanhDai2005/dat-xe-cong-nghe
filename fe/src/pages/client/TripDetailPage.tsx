import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { customerApi, type TripDetailResult } from "@/services/customer.service";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<TripDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId) return;
    customerApi
      .getTripDetail(tripId)
      .then((res) => {
        if (res.data) setTrip(res.data);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải thông tin chi tiết chuyến xe");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8 text-slate-500 text-sm">
        Đang tải thông tin chuyến xe...
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy chuyến xe</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || "Chuyến xe không tồn tại"}</p>
        <Link
          to="/trips"
          className="px-5 py-2.5 rounded-xl bg-[#0050c8] text-white text-xs font-bold shadow-md"
        >
          Quay lại danh sách chuyến
        </Link>
      </div>
    );
  }

  const depDate = new Date(trip.schedule.departureTime);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0050c8]"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về Danh sách chuyến xe
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#0050c8] mb-2 inline-block">
                {trip.vehicle.vehicleTypeName} • Biển {trip.vehicle.licensePlate}
              </span>
              <h1 className="text-2xl font-black text-slate-900">
                {trip.route.origin} → {trip.route.destination}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Khoảng cách: {trip.route.distance} km • Thời gian di chuyển ước tính:{" "}
                {trip.route.estimatedDuration} phút
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Giá vé tiêu chuẩn</span>
              <span className="text-2xl font-black text-[#0050c8]">
                {formatPrice(trip.price)}
              </span>
              <span className="text-xs text-slate-500 block">/ ghế ngồi</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 block mb-1">Giờ khởi hành</span>
              <div className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0050c8]" />
                {depDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 block mb-1">Ngày di chuyển</span>
              <div className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0050c8]" />
                {depDate.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 block mb-1">Tổng sức chứa</span>
              <div className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                {trip.vehicle.totalSeats} ghế tiêu chuẩn
              </div>
            </div>
          </div>
        </div>

        {/* Stops timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Điểm đón */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Các điểm đón khách ({trip.pickupPoints?.length || 0})
            </h2>

            <div className="space-y-3">
              {trip.pickupPoints?.map((p, idx) => (
                <div key={p.stopId} className="flex items-start gap-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{p.stopName}</div>
                    <div className="text-slate-500 mt-0.5">{p.address}</div>
                  </div>
                </div>
              ))}
              {(!trip.pickupPoints || trip.pickupPoints.length === 0) && (
                <p className="text-xs text-slate-400">Đón tại bến xe trung tâm xuất phát.</p>
              )}
            </div>
          </div>

          {/* Điểm trả */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              Các điểm trả khách ({trip.dropoffPoints?.length || 0})
            </h2>

            <div className="space-y-3">
              {trip.dropoffPoints?.map((p, idx) => (
                <div key={p.stopId} className="flex items-start gap-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-red-50 text-red-500 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{p.stopName}</div>
                    <div className="text-slate-500 mt-0.5">{p.address}</div>
                  </div>
                </div>
              ))}
              {(!trip.dropoffPoints || trip.dropoffPoints.length === 0) && (
                <p className="text-xs text-slate-400">Trả tại bến xe đích đến của tuyến.</p>
              )}
            </div>
          </div>
        </div>

        {/* Action card */}
        <div className="bg-gradient-to-tr from-blue-900 to-[#0050c8] rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black mb-1">Sẵn sàng đặt chỗ cho chuyến này?</h3>
            <p className="text-xs text-blue-100">
              Chọn ghế ngồi ưng ý trên sơ đồ xe và giữ chỗ tức thì trong 15 phút.
            </p>
          </div>

          <Link
            to={`/booking?routeId=${encodeURIComponent(trip.route.routeId)}`}
            className="px-8 py-3.5 bg-white text-[#0050c8] hover:bg-blue-50 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
          >
            Chọn ghế & Đặt vé ngay
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
