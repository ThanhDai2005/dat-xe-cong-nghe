import { useCallback, useEffect, useState } from "react";
import {
  CarFront,
  CheckCircle2,
  Clock,
  Edit,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  adminApi,
  adminErrorMessage,
  type AdminVehicle,
  type AdminVehicleType,
  type CreateVehiclePayload,
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

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<AdminVehicleType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Modals
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<CreateVehiclePayload>({
    licensePlate: "",
    vehicleType: "",
    totalSeats: 4,
  });

  const [assigningVehicle, setAssigningVehicle] = useState<AdminVehicle | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");

  const [manageTypesOpen, setManageTypesOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const load = useCallback(async () => {
    try {
      const [v, vt] = await Promise.all([adminApi.vehicles(), adminApi.vehicleTypes()]);
      setVehicles(v);
      setVehicleTypes(vt);
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.licensePlate.trim()) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.createVehicle({
        licensePlate: vehicleForm.licensePlate.trim().toUpperCase(),
        vehicleType: vehicleForm.vehicleType || undefined,
        totalSeats: Number(vehicleForm.totalSeats),
      });
      setAddVehicleModalOpen(false);
      setVehicleForm({ licensePlate: "", vehicleType: "", totalSeats: 4 });
      setNotice("Đã thêm mới phương tiện vào đội xe thành công.");
      await load();
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveTypeAssignment = async () => {
    if (!assigningVehicle) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.assignVehicleType(assigningVehicle.vehicleId, selectedTypeId || null);
      setAssigningVehicle(null);
      setNotice(`Đã cập nhật phân loại xe cho biển số "${assigningVehicle.licensePlate}".`);
      await load();
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleAddVehicleType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const created = await adminApi.createVehicleType(newTypeName.trim());
      setNewTypeName("");
      await load();
      setNotice(`Đã thêm mới phân loại: "${created.typeName}".`);
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const visibleVehicles = vehicles.filter((v) =>
    `${v.licensePlate} ${v.vehicleTypeName || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Đội Ngũ Phương Tiện
            </h2>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {vehicles.length} phương tiện hoạt động
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Quản lý biển số xe, số lượng ghế quy chuẩn và phân loại xe (/api/v1/admin/vehicles, /vehicle-types).
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
            onClick={() => setManageTypesOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <Layers size={14} className="text-purple-600" />
            <span>Phân loại xe ({vehicleTypes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setAddVehicleModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <Plus size={15} />
            <span>Thêm phương tiện</span>
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

      {/* ─── METRIC CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tổng phương tiện</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{vehicles.length}</span>
            <CarFront size={20} className="text-blue-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Trạng thái Active</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">
              {vehicles.filter(v => v.status === "ACTIVE").length}
            </span>
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tổng ghế khả dụng</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {vehicles.reduce((acc, v) => acc + (v.seatCount || 0), 0)}
            </span>
            <Users size={20} className="text-purple-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Phân loại xe</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{vehicleTypes.length}</span>
            <Layers size={20} className="text-amber-500" />
          </div>
        </div>
      </div>

      {/* ─── DATA TABLE ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo biển số, loại xe..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Hiển thị {visibleVehicles.length} trên tổng {vehicles.length} xe
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
              <TableRow>
                <TableHead className="w-16 font-bold text-xs">MÃ</TableHead>
                <TableHead className="font-bold text-xs">BIỂN SỐ XE</TableHead>
                <TableHead className="font-bold text-xs">PHÂN LOẠI XE (TYPE)</TableHead>
                <TableHead className="font-bold text-xs">SỐ LƯỢNG GHẾ</TableHead>
                <TableHead className="font-bold text-xs">TRẠNG THÁI VẬN HÀNH</TableHead>
                <TableHead className="font-bold text-xs text-right">THIẾT LẬP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    <RefreshCw size={14} className="animate-spin inline mr-1" />
                    Đang tải danh sách phương tiện...
                  </TableCell>
                </TableRow>
              ) : visibleVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Không tìm thấy phương tiện nào.
                  </TableCell>
                </TableRow>
              ) : (
                visibleVehicles.map((v) => (
                  <TableRow key={v.vehicleId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono text-xs font-semibold text-slate-500">
                      #{v.vehicleId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                          {v.licensePlate}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {v.vehicleTypeName ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                          <Tag size={12} />
                          {v.vehicleTypeName}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa phân loại</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Users size={13} className="text-slate-400" />
                        {v.seatCount} chỗ ngồi
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          v.status === "ACTIVE"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {v.status === "ACTIVE" ? "Sẵn sàng chạy" : "Tạm ngưng"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setAssigningVehicle(v);
                          setSelectedTypeId(v.vehicleTypeId || "");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 transition-colors"
                      >
                        <Edit size={12} />
                        <span>Đổi loại xe</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── ADD VEHICLE MODAL ────────────────────────────────────────────── */}
      {addVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm Phương Tiện Mới
              </h3>
              <button
                type="button"
                onClick={() => setAddVehicleModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biển số xe *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 29B-999.88"
                  value={vehicleForm.licensePlate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                  className="w-full uppercase font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số lượng ghế quy chuẩn *
                  </label>
                  <select
                    value={vehicleForm.totalSeats}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, totalSeats: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value={4}>4 Chỗ</option>
                    <option value={7}>7 Chỗ</option>
                    <option value={9}>9 Chỗ (Limousine)</option>
                    <option value={16}>16 Chỗ</option>
                    <option value={29}>29 Chỗ</option>
                    <option value={45}>45 Chỗ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phân loại xe
                  </label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="">-- Chọn phân loại --</option>
                    {vehicleTypes.map((t) => (
                      <option key={t.vehicleTypeId} value={t.vehicleTypeId}>
                        {t.typeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddVehicleModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 disabled:opacity-50"
                >
                  {busy ? "Đang lưu..." : "Thêm phương tiện"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ASSIGN TYPE MODAL ───────────────────────────────────────────── */}
      {assigningVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Gán Phân Loại Cho Xe {assigningVehicle.licensePlate}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Chọn loại xe tương ứng để áp dụng bảng giá vé chuẩn theo loại.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Loại xe
              </label>
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">-- Chưa gán loại --</option>
                {vehicleTypes.map((t) => (
                  <option key={t.vehicleTypeId} value={t.vehicleTypeId}>
                    {t.typeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigningVehicle(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveTypeAssignment}
                disabled={busy}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 disabled:opacity-50"
              >
                {busy ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MANAGE TYPES MODAL ─────────────────────────────────────────── */}
      {manageTypesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-purple-600" />
                Quản Lý Danh Mục Loại Xe
              </h3>
              <button
                type="button"
                onClick={() => setManageTypesOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <form onSubmit={handleAddVehicleType} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nhập tên loại xe mới (VD: Limousine VIP)"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 disabled:opacity-50"
                >
                  Thêm
                </button>
              </form>

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Loại xe hiện có:</p>
                {vehicleTypes.map((t) => (
                  <div
                    key={t.vehicleTypeId}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {t.typeName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: #{t.vehicleTypeId}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setManageTypesOpen(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
