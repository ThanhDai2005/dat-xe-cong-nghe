import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  CarFront,
  CheckCircle2,
  Clock3,
  Edit,
  RefreshCw,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { adminApi, adminErrorMessage, currency } from "@/services/admin.service";
import type { AdminFare, AdminRoute, AdminTrip, AdminVehicle } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const blank = { routeId: "", vehicleId: "", departureTime: "", price: "" };

const localInput = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const two = (n: number) => String(n).padStart(2, "0");
  const vietnam = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return `${vietnam.getUTCFullYear()}-${two(vietnam.getUTCMonth() + 1)}-${two(
    vietnam.getUTCDate()
  )}T${two(vietnam.getUTCHours())}:${two(vietnam.getUTCMinutes())}`;
};

const vietnamDate = (value: string) => new Date(`${value}:00+07:00`);

const statusBadge = {
  OPEN: { label: "Đang mở", variant: "success" as const },
  CLOSED: { label: "Đã đóng", variant: "secondary" as const },
  CANCELLED: { label: "Đã hủy", variant: "destructive" as const },
};

export default function AdminTripsPage() {
  const [routes, setRoutes] = useState<AdminRoute[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [fares, setFares] = useState<AdminFare[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [routeFilter, setRouteFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [r, v, f, t] = await Promise.all([
        adminApi.routes(),
        adminApi.vehicles(),
        adminApi.fares(),
        adminApi.trips(),
      ]);
      setRoutes(r);
      setVehicles(v);
      setFares(f);
      setTrips(t);
    } catch (cause) {
      setError(adminErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () =>
      trips.filter(
        (trip) =>
          (!routeFilter || trip.routeId === routeFilter) &&
          (!dateFilter || localInput(trip.departureTime).slice(0, 10) === dateFilter) &&
          (!statusFilter || trip.status === statusFilter) &&
          `${trip.origin} ${trip.destination} ${trip.licensePlate}`
            .toLocaleLowerCase("vi-VN")
            .includes(search.toLocaleLowerCase("vi-VN"))
      ),
    [trips, routeFilter, dateFilter, statusFilter, search]
  );

  const suggestPrice = () => {
    const vehicle = vehicles.find((item) => item.vehicleId === form.vehicleId);
    const candidates = fares.filter(
      (fare) =>
        fare.routeId === form.routeId &&
        (fare.vehicleTypeId === vehicle?.vehicleTypeId || fare.vehicleTypeId === null)
    );
    const standard = candidates.filter((fare) => fare.bookingTypeName.toUpperCase() === "STANDARD");
    const best = (standard.length ? standard : candidates).sort(
      (a, b) => Number(b.vehicleTypeId !== null) - Number(a.vehicleTypeId !== null)
    )[0];
    if (best) {
      setForm((prev) => ({ ...prev, price: String(best.basePrice) }));
    } else {
      setError("Chưa có cấu hình giá vé cho tuyến và xe này. Hãy nhập thủ công hoặc tạo giá vé.");
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!form.departureTime || vietnamDate(form.departureTime).getTime() <= Date.now()) {
      setError("Giờ khởi hành phải ở trong tương lai.");
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá chuyến phải là số tiền dương.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        routeId: form.routeId,
        vehicleId: form.vehicleId,
        departureTime: vietnamDate(form.departureTime).toISOString(),
        price,
      };
      if (editId) {
        await adminApi.updateTrip(editId, payload);
        setNotice("Đã cập nhật thông tin chuyến xe.");
      } else {
        await adminApi.createTrip(payload);
        setNotice("Đã lên lịch chuyến xe thành công.");
      }
      setForm(blank);
      setEditId(null);
      setIsFormOpen(false);
      await load();
    } catch (cause) {
      setError(adminErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (trip: AdminTrip, status: AdminTrip["status"]) => {
    if (
      status === "CANCELLED" &&
      !window.confirm(`Hủy chuyến #${trip.tripId}? Chuyến đã có khách đặt chỗ sẽ không thể hủy trực tiếp.`)
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminApi.updateTripStatus(trip.tripId, status);
      await load();
      setNotice(`Đã chuyển chuyến #${trip.tripId} sang trạng thái ${statusBadge[status].label}.`);
    } catch (cause) {
      setError(adminErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (trip: AdminTrip) => {
    setEditId(trip.tripId);
    setForm({
      routeId: trip.routeId,
      vehicleId: trip.vehicleId,
      departureTime: localInput(trip.departureTime),
      price: String(trip.price ?? ""),
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Lịch Chuyến Xe Vận Hành
            </h2>
            <Badge variant="outline" className="font-mono text-xs">
              {trips.length} chuyến
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Lập kế hoạch xuất bến, theo dõi tỷ lệ lấp đầy ghế và điều phối chuyến theo thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void load();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm(blank);
              setIsFormOpen(!isFormOpen);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <CalendarPlus size={15} />
            {isFormOpen && !editId ? "Đóng form" : "Lên lịch chuyến mới"}
          </button>
        </div>
      </div>

      {/* Thông báo kết quả / lỗi */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}
      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice("")} className="text-emerald-400 hover:text-emerald-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─── MODAL / PANEL THÊM & SỬA CHUYẾN XE (Shadcn style) ────────────── */}
      {isFormOpen && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-6 shadow-sm dark:border-blue-900/60 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-blue-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
                <CalendarPlus size={16} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editId ? `Chỉnh sửa thông tin chuyến #${editId}` : "Lên lịch chuyến xe mới"}
              </h3>
            </div>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditId(null);
                setForm(blank);
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Route select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tuyến đường <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
                value={form.routeId}
                onChange={(e) => setForm({ ...form, routeId: e.target.value })}
              >
                <option value="">Chọn tuyến chạy</option>
                {routes.map((route) => (
                  <option key={route.routeId} value={route.routeId}>
                    {route.origin} → {route.destination} ({route.estimatedDuration} phút)
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Phương tiện phân công <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
                value={form.vehicleId}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              >
                <option value="">Chọn xe</option>
                {vehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.licensePlate} ({v.seatCount} chỗ{v.vehicleTypeName ? ` - ${v.vehicleTypeName}` : ""})
                  </option>
                ))}
              </select>
            </div>

            {/* Departure time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Giờ khởi hành (Việt Nam) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="datetime-local"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
                value={form.departureTime}
                onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
              />
            </div>

            {/* Price */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Giá chuyến (VNĐ) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={suggestPrice}
                  disabled={!form.routeId || !form.vehicleId}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline disabled:text-slate-400"
                >
                  <Sparkles size={12} />
                  Giá gợi ý
                </button>
              </div>
              <input
                required
                type="number"
                min="1000"
                step="1000"
                placeholder="Ví dụ: 150000"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditId(null);
                  setForm(blank);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? "Đang xử lý..." : editId ? "Lưu thay đổi chuyến" : "Xác nhận tạo chuyến"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── DATA TABLE & TOOLBAR (Shadcn Data-Table style) ──────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {/* Bộ lọc Filter Bar */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            {/* Search input */}
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tuyến hoặc biển số xe..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800"
              />
            </div>

            {/* Route filter */}
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800"
            >
              <option value="">Tất cả tuyến đường</option>
              {routes.map((r) => (
                <option key={r.routeId} value={r.routeId}>
                  {r.origin} → {r.destination}
                </option>
              ))}
            </select>

            {/* Date filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800"
            />

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="OPEN">Đang mở bán</option>
              <option value="CLOSED">Đã đóng</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Hiển thị <span className="font-bold text-slate-900 dark:text-white">{visible.length}</span> chuyến
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-blue-500" />
            Đang tải dữ liệu chuyến xe...
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">
            Không tìm thấy chuyến xe nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tuyến đường</TableHead>
                <TableHead>Phương tiện & Biển số</TableHead>
                <TableHead>Thời gian xuất bến</TableHead>
                <TableHead>Giá vé chuyến</TableHead>
                <TableHead>Lấp đầy ghế</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((trip) => {
                const badge = statusBadge[trip.status] || {
                  label: trip.status,
                  variant: "outline" as const,
                };
                const occupancyPercent = trip.totalSeats
                  ? Math.round((trip.bookedSeats / trip.totalSeats) * 100)
                  : 0;

                return (
                  <TableRow key={trip.tripId}>
                    <TableCell className="font-mono text-xs font-bold text-slate-500">
                      #{trip.tripId}
                    </TableCell>

                    <TableCell>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {trip.origin} → {trip.destination}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {trip.estimatedDuration} phút hành trình
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs dark:text-slate-200">
                        <CarFront size={14} className="text-blue-600" />
                        <span>{trip.licensePlate}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Tổng {trip.totalSeats} chỗ ngồi
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Clock3 size={13} className="text-slate-400" />
                        {new Date(trip.departureTime).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>

                    <TableCell className="font-extrabold text-blue-600 text-xs">
                      {trip.price ? currency(trip.price) : "Theo biểu cước"}
                    </TableCell>

                    <TableCell>
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          <span>{trip.bookedSeats}/{trip.totalSeats} ghế</span>
                          <span>{occupancyPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              occupancyPercent >= 100
                                ? "bg-red-500"
                                : occupancyPercent > 50
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {trip.status !== "CANCELLED" && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(trip)}
                              title="Chỉnh sửa chuyến"
                              className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            >
                              <Edit size={15} />
                            </button>
                            {trip.status === "OPEN" ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void changeStatus(trip, "CLOSED")}
                                title="Đóng đặt chỗ"
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                              >
                                Đóng
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void changeStatus(trip, "OPEN")}
                                title="Mở đặt chỗ"
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                              >
                                Mở
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void changeStatus(trip, "CANCELLED")}
                              title="Hủy chuyến"
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
