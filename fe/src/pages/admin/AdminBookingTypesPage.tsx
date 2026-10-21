import { useCallback, useEffect, useState } from "react";
import {
  BookmarkCheck,
  CheckCircle2,
  FileText,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  adminApi,
  adminErrorMessage,
  type AdminBookingType,
  type CreateBookingTypePayload,
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

export default function AdminBookingTypesPage() {
  const [bookingTypes, setBookingTypes] = useState<AdminBookingType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState<CreateBookingTypePayload>({
    typeName: "",
    description: "",
  });

  const load = useCallback(async () => {
    try {
      const data = await adminApi.bookingTypes();
      setBookingTypes(data);
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.typeName.trim()) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.createBookingType({
        typeName: form.typeName.trim(),
        description: form.description?.trim() || undefined,
      });
      setAddModalOpen(false);
      setForm({ typeName: "", description: "" });
      setNotice("Đã thêm hình thức đặt xe mới thành công.");
      await load();
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const visibleTypes = bookingTypes.filter((t) =>
    `${t.typeName} ${t.description || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Hình Thức Đặt Xe
            </h2>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 border-purple-200 bg-purple-50/50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              {bookingTypes.length} loại dịch vụ
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Quản lý các mô hình đặt chuyến: Bao xe trọn gói, Ghế đơn tiện chuyến, Đưa đón sân bay (/api/v1/admin/booking-types).
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
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <Plus size={15} />
            <span>Thêm hình thức đặt</span>
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
              placeholder="Tìm kiếm hình thức..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
              <TableRow>
                <TableHead className="w-16 font-bold text-xs">MÃ</TableHead>
                <TableHead className="font-bold text-xs">TÊN HÌNH THỨC DỊCH VỤ</TableHead>
                <TableHead className="font-bold text-xs">MÔ TẢ CHI TIẾT</TableHead>
                <TableHead className="font-bold text-xs text-right">TRẠNG THÁI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-xs text-slate-400">
                    <RefreshCw size={14} className="animate-spin inline mr-1" />
                    Đang tải danh mục...
                  </TableCell>
                </TableRow>
              ) : visibleTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-xs text-slate-400">
                    Chưa có hình thức đặt xe nào.
                  </TableCell>
                </TableRow>
              ) : (
                visibleTypes.map((t) => (
                  <TableRow key={t.bookingTypeId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <TableCell className="font-mono text-xs font-semibold text-slate-500">
                      #{t.bookingTypeId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookmarkCheck size={16} className="text-purple-600 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {t.typeName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
                      {t.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          t.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {t.isActive ? "Đang áp dụng" : "Ngưng áp dụng"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── ADD MODAL ────────────────────────────────────────────────────── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm Hình Thức Đặt Xe
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên hình thức *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bao xe trọn gói, Ghế đơn tiện chuyến"
                  value={form.typeName}
                  onChange={(e) => setForm({ ...form, typeName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả chính sách và hình thức tính cước..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 disabled:opacity-50"
                >
                  {busy ? "Đang lưu..." : "Lưu hình thức"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
