import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Clock,
  Compass,
  Edit2,
  ListOrdered,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  adminApi,
  adminErrorMessage,
  type AdminRoute,
  type AdminStop,
  type CreateRoutePayload,
  type CreateStopPayload,
  type UpdateRoutePayload,
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

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<AdminRoute[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Modals
  const [addRouteModalOpen, setAddRouteModalOpen] = useState(false);
  const [editRoute, setEditRoute] = useState<AdminRoute | null>(null);
  const [deleteConfirmRoute, setDeleteConfirmRoute] = useState<AdminRoute | null>(null);

  // Form states
  const [routeForm, setRouteForm] = useState<CreateRoutePayload>({
    origin: "",
    destination: "",
    distance: 100,
    estimatedDuration: 120,
  });

  // Stops Drawer / Modal
  const [managingStopsRoute, setManagingStopsRoute] = useState<AdminRoute | null>(null);
  const [stops, setStops] = useState<AdminStop[]>([]);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [stopForm, setStopForm] = useState<CreateStopPayload>({
    routeId: "",
    stopName: "",
    address: "",
    type: "BOTH",
  });

  const load = useCallback(async () => {
    try {
      const data = await adminApi.routes();
      setRoutes(data);
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Load stops for a route
  const openStopsManager = async (route: AdminRoute) => {
    setManagingStopsRoute(route);
    setStopsLoading(true);
    setStopForm({
      routeId: route.routeId,
      stopName: "",
      address: "",
      type: "BOTH",
    });
    try {
      const res = await adminApi.stops(route.routeId);
      setStops(res);
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setStopsLoading(false);
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.origin.trim() || !routeForm.destination.trim()) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.createRoute({
        origin: routeForm.origin.trim(),
        destination: routeForm.destination.trim(),
        distance: Number(routeForm.distance),
        estimatedDuration: Number(routeForm.estimatedDuration),
      });
      setAddRouteModalOpen(false);
      setRouteForm({ origin: "", destination: "", distance: 100, estimatedDuration: 120 });
      setNotice("Đã thêm mới tuyến đường vận hành thành công.");
      await load();
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoute) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.updateRoute(editRoute.routeId, {
        origin: editRoute.origin.trim(),
        destination: editRoute.destination.trim(),
        distance: Number(editRoute.distance),
        estimatedDuration: Number(editRoute.estimatedDuration),
      });
      setEditRoute(null);
      setNotice("Đã cập nhật thông tin tuyến đường thành công.");
      await load();
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!deleteConfirmRoute) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.deleteRoute(deleteConfirmRoute.routeId);
      setDeleteConfirmRoute(null);
      setNotice("Đã ngưng hoạt động tuyến đường thành công.");
      await load();
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingStopsRoute || !stopForm.stopName.trim() || !stopForm.address.trim()) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.createStop({
        routeId: managingStopsRoute.routeId,
        stopName: stopForm.stopName.trim(),
        address: stopForm.address.trim(),
        type: stopForm.type,
      });
      setStopForm({
        routeId: managingStopsRoute.routeId,
        stopName: "",
        address: "",
        type: "BOTH",
      });
      const updated = await adminApi.stops(managingStopsRoute.routeId);
      setStops(updated);
      setNotice("Đã thêm điểm đón/trả vào hành trình.");
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!managingStopsRoute) return;
    setBusy(true);
    try {
      await adminApi.deleteStop(stopId);
      const updated = await adminApi.stops(managingStopsRoute.routeId);
      setStops(updated);
      setNotice("Đã xóa điểm đón/trả thành công.");
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const visibleRoutes = routes.filter((r) =>
    `${r.origin} ${r.destination}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Hành Lang & Tuyến Đường
            </h2>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 border-blue-200 bg-blue-50/50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {routes.length} hành lang hoạt động
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Quản lý tuyến liên tỉnh, cự ly km, thời gian di chuyển chuẩn và hệ thống điểm đón/trả khách (/api/v1/admin/routes, /stops).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void load();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </button>
          <button
            type="button"
            onClick={() => setAddRouteModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <Plus size={15} />
            <span>Thêm tuyến đường</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-emerald-500 hover:text-emerald-700">
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ─── DATA TABLE ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm hành lang, điểm đi, điểm đến..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Hiển thị {visibleRoutes.length} trên tổng {routes.length} tuyến
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
              <TableRow>
                <TableHead className="w-16 font-bold text-xs">MÃ</TableHead>
                <TableHead className="font-bold text-xs">HÀNH LANG VẬN HÀNH</TableHead>
                <TableHead className="font-bold text-xs">CỰ LY (KM)</TableHead>
                <TableHead className="font-bold text-xs">THỜI GIAN DỰ KIẾN</TableHead>
                <TableHead className="font-bold text-xs">TRẠNG THÁI</TableHead>
                <TableHead className="font-bold text-xs text-center">ĐIỂM ĐÓN / TRẢ</TableHead>
                <TableHead className="font-bold text-xs text-right">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Đang tải danh sách tuyến đường...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : visibleRoutes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Không tìm thấy tuyến đường nào phù hợp với từ khóa.
                  </TableCell>
                </TableRow>
              ) : (
                visibleRoutes.map((r) => (
                  <TableRow key={r.routeId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono text-xs font-semibold text-slate-500">
                      #{r.routeId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {r.origin}
                        </span>
                        <ArrowRight size={13} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {r.destination}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold">
                        <Compass size={11} className="text-blue-500" />
                        {r.distance} km
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        {Math.floor(r.estimatedDuration / 60)}h {r.estimatedDuration % 60 > 0 ? `${r.estimatedDuration % 60}p` : ""}
                        <span className="text-slate-400 text-[11px]">({r.estimatedDuration} phút)</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          r.status === "ACTIVE"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {r.status === "ACTIVE" ? "Đang vận hành" : "Ngừng phục vụ"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => void openStopsManager(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-950 dark:text-blue-400 transition-colors"
                      >
                        <ListOrdered size={13} />
                        <span>Xem & Quản lý trạm</span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditRoute(r)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="Sửa tuyến đường"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmRoute(r)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          title="Ngừng kích hoạt"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── ADD ROUTE MODAL ──────────────────────────────────────────────── */}
      {addRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm Tuyến Đường Vận Hành Mới
              </h3>
              <button
                type="button"
                onClick={() => setAddRouteModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddRoute} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm đi (Origin) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hà Nội"
                    value={routeForm.origin}
                    onChange={(e) => setRouteForm({ ...routeForm, origin: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm đến (Destination) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hải Phòng"
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Khoảng cách (km) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={routeForm.distance}
                    onChange={(e) => setRouteForm({ ...routeForm, distance: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thời gian chạy (phút) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={routeForm.estimatedDuration}
                    onChange={(e) => setRouteForm({ ...routeForm, estimatedDuration: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddRouteModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 disabled:opacity-50"
                >
                  {busy ? "Đang lưu..." : "Lưu tuyến đường"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT ROUTE MODAL ─────────────────────────────────────────────── */}
      {editRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cập Nhật Tuyến #{editRoute.routeId}
              </h3>
              <button
                type="button"
                onClick={() => setEditRoute(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateRoute} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm đi *
                  </label>
                  <input
                    type="text"
                    required
                    value={editRoute.origin}
                    onChange={(e) => setEditRoute({ ...editRoute, origin: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm đến *
                  </label>
                  <input
                    type="text"
                    required
                    value={editRoute.destination}
                    onChange={(e) => setEditRoute({ ...editRoute, destination: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cự ly (km) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editRoute.distance}
                    onChange={(e) => setEditRoute({ ...editRoute, distance: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thời gian chạy (phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editRoute.estimatedDuration}
                    onChange={(e) => setEditRoute({ ...editRoute, estimatedDuration: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditRoute(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 disabled:opacity-50"
                >
                  {busy ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE ROUTE CONFIRM MODAL ──────────────────────────────────── */}
      {deleteConfirmRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-red-600">
              Xác nhận ngưng hoạt động tuyến đường
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Bạn có chắc chắn muốn ngưng vận hành tuyến{" "}
              <strong>{deleteConfirmRoute.origin} ➔ {deleteConfirmRoute.destination}</strong> (Mã #{deleteConfirmRoute.routeId})?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRoute(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteRoute}
                disabled={busy}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy ? "Đang xử lý..." : "Xác nhận ngưng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STOPS MANAGEMENT MODAL / DRAWER ─────────────────────────────── */}
      {managingStopsRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={18} className="text-blue-600" />
                  Điểm Đón / Trả Tuyến: {managingStopsRoute.origin} ➔ {managingStopsRoute.destination}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thiết lập danh sách trạm trung chuyển, bến xe và điểm đón tận nơi trên hành lang.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagingStopsRoute(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Form Add Stop */}
              <form onSubmit={handleAddStop} className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-1.5">
                  <Plus size={14} /> Thêm điểm đón / trả mới
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tên điểm đón/trả *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Bến xe Mỹ Đình"
                      value={stopForm.stopName}
                      onChange={(e) => setStopForm({ ...stopForm, stopName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Địa chỉ cụ thể *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Số 20 Phạm Hùng, Từ Liêm"
                      value={stopForm.address}
                      onChange={(e) => setStopForm({ ...stopForm, address: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hình thức phục vụ
                    </label>
                    <select
                      value={stopForm.type}
                      onChange={(e) => setStopForm({ ...stopForm, type: e.target.value as "PICKUP" | "DROPOFF" | "BOTH" })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="BOTH">Cả Đón & Trả (BOTH)</option>
                      <option value="PICKUP">Chỉ Đón Khách (PICKUP)</option>
                      <option value="DROPOFF">Chỉ Trả Khách (DROPOFF)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus size={13} />
                    <span>{busy ? "Đang lưu..." : "Thêm điểm dừng"}</span>
                  </button>
                </div>
              </form>

              {/* Stops List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Danh sách điểm dừng hiện hành ({stops.length} điểm)
                </h4>
                {stopsLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <RefreshCw size={14} className="animate-spin inline mr-1" />
                    Đang tải danh sách điểm dừng...
                  </div>
                ) : stops.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    Chưa có điểm đón/trả nào được gán cho tuyến đường này. Hãy thêm mới ở phía trên.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                    {stops.map((s, idx) => (
                      <div key={s.stopId} className="flex items-center justify-between p-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <div className="flex items-center gap-3">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 font-bold text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {s.stopName}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] font-bold ${
                                  s.type === "PICKUP"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : s.type === "DROPOFF"
                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                    : "border-purple-200 bg-purple-50 text-purple-700"
                                }`}
                              >
                                {s.type === "PICKUP" ? "ĐÓN KHÁCH" : s.type === "DROPOFF" ? "TRẢ KHÁCH" : "ĐÓN & TRẢ"}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{s.address}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDeleteStop(s.stopId)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors"
                          title="Xóa điểm dừng"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setManagingStopsRoute(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
