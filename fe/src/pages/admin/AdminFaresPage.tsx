import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CarFront,
  CheckCircle2,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import {
  adminApi,
  adminErrorMessage,
  currency,
  type AdminBookingType,
  type AdminFare,
  type AdminRoute,
  type AdminVehicle,
  type AdminVehicleType,
} from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const emptyForm = { routeId: "", bookingTypeId: "", vehicleTypeId: "", basePrice: "" };

export default function AdminFaresPage() {
  const [routes, setRoutes] = useState<AdminRoute[]>([]);
  const [bookingTypes, setBookingTypes] = useState<AdminBookingType[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<AdminVehicleType[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [fares, setFares] = useState<AdminFare[]>([]);

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [routeFilter, setRouteFilter] = useState("");
  const [search, setSearch] = useState("");
  const [vehicleTypeName, setVehicleTypeName] = useState("");

  const [vehicleId, setVehicleId] = useState("");
  const [assignedTypeId, setAssignedTypeId] = useState("");

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [routesData, bookingTypesData, vehicleTypesData, vehiclesData, faresData] =
        await Promise.all([
          adminApi.routes(),
          adminApi.bookingTypes(),
          adminApi.vehicleTypes(),
          adminApi.vehicles(),
          adminApi.fares(),
        ]);
      setRoutes(routesData);
      setBookingTypes(bookingTypesData);
      setVehicleTypes(vehicleTypesData);
      setVehicles(vehiclesData);
      setFares(faresData);
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
      fares.filter(
        (fare) =>
          (!routeFilter || fare.routeId === routeFilter) &&
          `${fare.origin} ${fare.destination} ${fare.bookingTypeName} ${fare.vehicleTypeName || ""}`
            .toLocaleLowerCase("vi-VN")
            .includes(search.toLocaleLowerCase("vi-VN"))
      ),
    [fares, routeFilter, search]
  );

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const amount = Number(form.basePrice);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Giá vé phải là số tiền dương.");
      return;
    }
    setBusy(true);
    try {
      if (editId) {
        await adminApi.updateFare(editId, amount);
        setNotice("Đã cập nhật giá vé thành công.");
      } else {
        await adminApi.createFare({
          routeId: form.routeId,
          bookingTypeId: form.bookingTypeId,
          vehicleTypeId: form.vehicleTypeId || null,
          basePrice: amount,
        });
        setNotice("Đã thêm cấu hình giá vé mới.");
      }
      setForm(emptyForm);
      setEditId(null);
      setIsFormOpen(false);
      await load();
    } catch (cause) {
      setError(adminErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const addVehicleType = async () => {
    if (!vehicleTypeName.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const created = await adminApi.createVehicleType(vehicleTypeName.trim());
      setVehicleTypeName("");
      setForm((prev) => ({ ...prev, vehicleTypeId: created.vehicleTypeId }));
      await load();
      setNotice(`Đã thêm loại xe mới: "${created.typeName}".`);
    } catch (cause) {
      setError(adminErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const saveVehicleType = async () => {
    if (!vehicleId) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminApi.assignVehicleType(vehicleId, assignedTypeId || null);
      await load();
      setNotice("Đã cập nhật loại xe cho phương tiện.");
    } catch (cause) {
      setError(adminErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (fare: AdminFare) => {
    if (
      !window.confirm(
        `Ngừng áp dụng giá ${currency(fare.basePrice)} cho tuyến ${fare.origin} → ${fare.destination}?`
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminApi.deleteFare(fare.fareId);
      if (editId === fare.fareId) {
        setEditId(null);
        setForm(emptyForm);
      }
      await load();
      setNotice("Đã ngừng áp dụng giá vé.");
    } catch (cause) {
      setError(adminErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (fare: AdminFare) => {
    setEditId(fare.fareId);
    setForm({
      routeId: fare.routeId,
      bookingTypeId: fare.bookingTypeId,
      vehicleTypeId: fare.vehicleTypeId || "",
      basePrice: String(fare.basePrice),
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
              Thiết Lập Biểu Cước Giá Vé
            </h2>
            <Badge variant="outline" className="font-mono text-xs">
              {fares.length} cấu hình
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý bảng giá cơ sở theo từng tuyến đường, loại hình dịch vụ và phân loại phương tiện.
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
              setForm(emptyForm);
              setIsFormOpen(!isFormOpen);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={15} />
            {isFormOpen && !editId ? "Đóng form" : "Thêm giá vé mới"}
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

      {/* ─── MODAL / PANEL THÊM & SỬA GIÁ VÉ ──────────────────────────────── */}
      {isFormOpen && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-6 shadow-sm dark:border-blue-900/60 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-blue-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
                <Tag size={16} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editId ? "Chỉnh sửa cấu hình giá vé" : "Tạo cấu hình giá vé mới"}
              </h3>
            </div>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditId(null);
                setForm(emptyForm);
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Tuyến đường */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tuyến đường áp dụng <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={!!editId}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                value={form.routeId}
                onChange={(e) => setForm({ ...form, routeId: e.target.value })}
              >
                <option value="">Chọn tuyến đường</option>
                {routes.map((r) => (
                  <option key={r.routeId} value={r.routeId}>
                    {r.origin} → {r.destination}
                  </option>
                ))}
              </select>
            </div>

            {/* Hình thức đặt xe */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Hình thức dịch vụ <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={!!editId}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                value={form.bookingTypeId}
                onChange={(e) => setForm({ ...form, bookingTypeId: e.target.value })}
              >
                <option value="">Chọn hình thức</option>
                {bookingTypes.map((t) => (
                  <option key={t.bookingTypeId} value={t.bookingTypeId}>
                    {t.typeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Loại xe */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Loại phương tiện
              </label>
              <select
                disabled={!!editId}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                value={form.vehicleTypeId}
                onChange={(e) => setForm({ ...form, vehicleTypeId: e.target.value })}
              >
                <option value="">Tất cả loại xe (Giá chung)</option>
                {vehicleTypes.map((vt) => (
                  <option key={vt.vehicleTypeId} value={vt.vehicleTypeId}>
                    {vt.typeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Giá cơ sở */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Giá vé cơ sở (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="1000"
                step="1000"
                placeholder="Ví dụ: 150000"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              />
            </div>

            {/* Quick add vehicle type */}
            {!editId && (
              <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-dashed border-slate-300 bg-white/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/40">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Cần loại xe mới chưa có trong danh sách?
                </span>
                <div className="flex max-w-md gap-2">
                  <input
                    value={vehicleTypeName}
                    onChange={(e) => setVehicleTypeName(e.target.value)}
                    placeholder="Tên loại xe (ví dụ: Limousine 9 chỗ VIP)"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    disabled={busy || !vehicleTypeName.trim()}
                    onClick={() => void addVehicleType()}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40"
                  >
                    <Plus size={13} />
                    Thêm loại
                  </button>
                </div>
              </div>
            )}

            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditId(null);
                  setForm(emptyForm);
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
                {busy ? "Đang lưu..." : editId ? "Lưu giá mới" : "Tạo cấu hình giá"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── DATA TABLE & TOOLBAR ────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Cột trái (8/12): Bảng danh sách giá vé */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* Filter bar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <div className="relative min-w-[200px] flex-1">
                  <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tuyến, dịch vụ, loại xe..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
                <select
                  value={routeFilter}
                  onChange={(e) => setRouteFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800"
                >
                  <option value="">Tất cả tuyến</option>
                  {routes.map((r) => (
                    <option key={r.routeId} value={r.routeId}>
                      {r.origin} → {r.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Hiển thị <span className="font-bold text-slate-900 dark:text-white">{visible.length}</span> mục
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-slate-400">
                <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-blue-500" />
                Đang tải bảng giá vé...
              </div>
            ) : visible.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">
                Không có cấu hình giá vé nào phù hợp.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tuyến đường</TableHead>
                    <TableHead>Hình thức</TableHead>
                    <TableHead>Loại xe áp dụng</TableHead>
                    <TableHead>Giá vé cơ sở</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((fare) => (
                    <TableRow key={fare.fareId}>
                      <TableCell>
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {fare.origin} → {fare.destination}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {fare.bookingTypeName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                        {fare.vehicleTypeName ? (
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {fare.vehicleTypeName}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Áp dụng tất cả xe</span>
                        )}
                      </TableCell>
                      <TableCell className="font-extrabold text-blue-600 text-sm">
                        {currency(fare.basePrice)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">Đang áp dụng</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(fare)}
                            title="Sửa giá vé"
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void remove(fare)}
                            title="Ngừng áp dụng"
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Cột phải (4/12): Gán loại xe cho phương tiện */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                <CarFront size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Gán Loại Xe Cho Phương Tiện
                </h3>
                <p className="text-[11px] text-slate-400">
                  Áp dụng giá cước đặc thù theo từng xe
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Chọn phương tiện
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => {
                    const sel = vehicles.find((v) => v.vehicleId === e.target.value);
                    setVehicleId(e.target.value);
                    setAssignedTypeId(sel?.vehicleTypeId || "");
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">Chọn biển số xe</option>
                  {vehicles.map((v) => (
                    <option key={v.vehicleId} value={v.vehicleId}>
                      {v.licensePlate} ({v.seatCount} chỗ{v.vehicleTypeName ? ` - ${v.vehicleTypeName}` : ""})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Phân loại xe áp dụng
                </label>
                <select
                  value={assignedTypeId}
                  onChange={(e) => setAssignedTypeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">Chưa gán (Áp dụng giá vé chung)</option>
                  {vehicleTypes.map((vt) => (
                    <option key={vt.vehicleTypeId} value={vt.vehicleTypeId}>
                      {vt.typeName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={busy || !vehicleId}
                onClick={() => void saveVehicleType()}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-40"
              >
                Cập nhật phân loại xe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
