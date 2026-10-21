import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  HelpCircle,
  Percent,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import {
  adminApi,
  adminErrorMessage,
  currency,
  formatDateTime,
  type AdminCancellation,
  type AdminRefund,
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

export default function AdminCancellationsPage() {
  const [activeTab, setActiveTab] = useState<"cancellations" | "refunds">("cancellations");
  const [cancellations, setCancellations] = useState<AdminCancellation[]>([]);
  const [refunds, setRefunds] = useState<AdminRefund[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Approve Cancellation Modal
  const [approvingItem, setApprovingItem] = useState<AdminCancellation | null>(null);
  const [approveForm, setApproveForm] = useState({
    adminId: "ADMIN",
    reasonNote: "Đã kiểm tra hợp lệ chính sách hoàn hủy",
    applyCommissionPenalty: false,
  });

  // Process Refund Modal
  const [refundingItem, setRefundingItem] = useState<AdminCancellation | null>(null);
  const [refundPercentage, setRefundPercentage] = useState<number>(100);

  const load = useCallback(async () => {
    try {
      const [cList, rList] = await Promise.all([
        adminApi.cancellations(),
        adminApi.refunds(),
      ]);
      setCancellations(cList);
      setRefunds(rList);
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingItem) return;
    setBusy(true);
    setError("");
    try {
      const res = await adminApi.approveCancellation(approvingItem.cancellationId, {
        adminId: approveForm.adminId || "ADMIN",
        reasonNote: approveForm.reasonNote.trim(),
        applyCommissionPenalty: approveForm.applyCommissionPenalty,
      });
      setApprovingItem(null);
      setNotice(
        `Đã duyệt yêu cầu hủy #${res.data?.cancellationId || approvingItem.cancellationId}${
          res.data?.penaltyAmount ? ` (Phí phạt/hoa hồng: ${currency(res.data.penaltyAmount)})` : ""
        }.`
      );
      await load();
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingItem) return;
    setBusy(true);
    setError("");
    try {
      const res = await adminApi.processRefund({
        bookingId: refundingItem.bookingId,
        cancellationId: refundingItem.cancellationId,
        refundPercentage: Number(refundPercentage),
      });
      setRefundingItem(null);
      setNotice(
        `Đã hoàn tất lệnh hoàn tiền ${currency(res.data?.finalRefundAmount || 0)} cho đơn #${refundingItem.bookingId.slice(0, 8)}.`
      );
      await load();
      setActiveTab("refunds");
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const visibleCancellations = cancellations.filter((c) => {
    const text = `${c.cancellationId} ${c.bookingId} ${c.customerName || ""} ${c.reason}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const visibleRefunds = refunds.filter((r) => {
    const text = `${r.refundId} ${r.bookingId} ${r.customerName || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Hủy Chuyến & Xử Lý Hoàn Tiền
            </h2>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 border-amber-200 bg-amber-50/50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              {cancellations.filter((c) => c.status === "PENDING").length} yêu cầu cần duyệt
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kiểm tra chính sách, phạt hoa hồng nhà xe, phê duyệt hủy chuyến và lệnh hoàn cước tự động (/api/v1/admin/cancellations, /refunds).
          </p>
        </div>

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

      {/* ─── TABS SWITCHER ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("cancellations")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "cancellations"
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
            }`}
          >
            Yêu Cầu Hủy Chuyến ({cancellations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("refunds")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "refunds"
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
            }`}
          >
            Lịch Sử Đã Hoàn Tiền ({refunds.length})
          </button>
        </div>

        <div className="relative min-w-[240px] flex-1 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, khách, lý do..."
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
      </div>

      {/* ─── TAB 1: CANCELLATIONS TABLE ──────────────────────────────────── */}
      {activeTab === "cancellations" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
                <TableRow>
                  <TableHead className="font-bold text-xs">MÃ YÊU CẦU</TableHead>
                  <TableHead className="font-bold text-xs">MÃ ĐƠN VÉ</TableHead>
                  <TableHead className="font-bold text-xs">KHÁCH HÀNG</TableHead>
                  <TableHead className="font-bold text-xs">LÝ DO HỦY CHUYẾN</TableHead>
                  <TableHead className="font-bold text-xs">NGƯỜI YÊU CẦU</TableHead>
                  <TableHead className="font-bold text-xs">TỔNG CƯỚC</TableHead>
                  <TableHead className="font-bold text-xs">TRẠNG THÁI</TableHead>
                  <TableHead className="font-bold text-xs text-right">HÀNH ĐỘNG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-xs text-slate-400">
                      <RefreshCw size={14} className="animate-spin inline mr-1" />
                      Đang tải danh sách yêu cầu hủy...
                    </TableCell>
                  </TableRow>
                ) : visibleCancellations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-xs text-slate-400">
                      Không có yêu cầu hủy nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleCancellations.map((c) => (
                    <TableRow key={c.cancellationId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        #{c.cancellationId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {c.bookingId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {c.customerName || "Khách hàng"}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {c.contactPhone || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300 max-w-xs">
                        <p className="truncate" title={c.reason}>
                          {c.reason}
                        </p>
                        {c.reasonNote && (
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 italic">
                            Admin note: {c.reasonNote}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {c.requestedBy}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                        {currency(c.totalFare)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            c.status === "APPROVED"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : c.status === "PENDING"
                              ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {c.status === "APPROVED" ? "Đã duyệt hủy" : c.status === "PENDING" ? "Chờ duyệt" : "Từ chối"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status === "PENDING" ? (
                            <button
                              type="button"
                              onClick={() => setApprovingItem(c)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                            >
                              <CheckCircle2 size={12} />
                              <span>Duyệt hủy</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setRefundingItem(c);
                                setRefundPercentage(c.applyCommissionPenalty ? 90 : 100);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 transition-colors"
                            >
                              <RotateCcw size={12} />
                              <span>Hoàn tiền</span>
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ─── TAB 2: REFUNDS TABLE ────────────────────────────────────────── */}
      {activeTab === "refunds" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
                <TableRow>
                  <TableHead className="font-bold text-xs">MÃ HOÀN TIỀN</TableHead>
                  <TableHead className="font-bold text-xs">MÃ ĐƠN VÉ</TableHead>
                  <TableHead className="font-bold text-xs">KHÁCH HÀNG & TUYẾN</TableHead>
                  <TableHead className="font-bold text-xs">TỔNG CƯỚC BAN ĐẦU</TableHead>
                  <TableHead className="font-bold text-xs">TỶ LỆ HOÀN</TableHead>
                  <TableHead className="font-bold text-xs">SỐ TIỀN HOÀN THỰC TẾ</TableHead>
                  <TableHead className="font-bold text-xs">THỜI GIAN HOÀN</TableHead>
                  <TableHead className="font-bold text-xs text-right">TRẠNG THÁI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-xs text-slate-400">
                      <RefreshCw size={14} className="animate-spin inline mr-1" />
                      Đang tải danh sách hoàn tiền...
                    </TableCell>
                  </TableRow>
                ) : visibleRefunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-xs text-slate-400">
                      Chưa có giao dịch hoàn tiền nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRefunds.map((r) => (
                    <TableRow key={r.refundId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
                        #{r.refundId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {r.bookingId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {r.customerName || "Khách hàng"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {r.origin} ➔ {r.destination}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 line-through">
                        {currency(r.totalFare)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-950 px-2 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                          {r.refundPercentage}%
                        </span>
                      </TableCell>
                      <TableCell className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                        {currency(r.finalRefundAmount)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDateTime(r.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold"
                        >
                          ĐÃ HOÀN TIỀN
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ─── APPROVE MODAL ────────────────────────────────────────────────── */}
      {approvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Duyệt Yêu Cầu Hủy Chuyến #{approvingItem.cancellationId}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Kiểm tra đơn #{approvingItem.bookingId.slice(0, 8)} của khách <strong>{approvingItem.customerName}</strong> (Tổng cước: {currency(approvingItem.totalFare)}).
            </p>

            <form onSubmit={handleApprove} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã Admin thực hiện duyệt
                </label>
                <input
                  type="text"
                  required
                  value={approveForm.adminId}
                  onChange={(e) => setApproveForm({ ...approveForm, adminId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú lý do phê duyệt (reasonNote) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={approveForm.reasonNote}
                  onChange={(e) => setApproveForm({ ...approveForm, reasonNote: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 resize-none"
                />
              </div>

              <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={approveForm.applyCommissionPenalty}
                    onChange={(e) => setApproveForm({ ...approveForm, applyCommissionPenalty: e.target.checked })}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Áp dụng phí phạt hủy / Giữ lại hoa hồng 10%
                    </span>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
                      Phạt {currency(Math.round(approvingItem.totalFare * 0.1))} (10% tổng cước) theo chính sách hủy chuyến sát giờ.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setApprovingItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy ? "Đang xử lý..." : "Xác nhận duyệt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PROCESS REFUND MODAL ────────────────────────────────────────── */}
      {refundingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw size={18} className="text-blue-600" />
              Lập Lệnh Hoàn Tiền Vé
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Đơn hàng: #{refundingItem.bookingId.slice(0, 8)} | Khách: {refundingItem.customerName}
            </p>

            <form onSubmit={handleProcessRefund} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Tỷ lệ hoàn tiền:</span>
                  <span className="font-bold text-blue-600 text-sm">{refundPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={refundPercentage}
                  onChange={(e) => setRefundPercentage(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>90% (Khấu trừ)</span>
                  <span>100% (Hoàn trọn gói)</span>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2 dark:border-slate-800 dark:bg-slate-950/50 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tổng tiền vé ban đầu:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{currency(refundingItem.totalFare)}</span>
                </div>
                {refundingItem.penaltyAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Phí phạt khấu trừ:</span>
                    <span className="font-semibold">-{currency(refundingItem.penaltyAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 dark:text-white">Số tiền hoàn thực nhận:</span>
                  <span className="text-lg font-black text-emerald-600">
                    {currency(Math.max(0, Math.round(refundingItem.totalFare * (refundPercentage / 100) - (refundingItem.penaltyAmount || 0))))}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRefundingItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {busy ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
