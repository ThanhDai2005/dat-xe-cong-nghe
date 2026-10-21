import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  DollarSign,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import {
  adminApi,
  adminErrorMessage,
  currency,
  formatDateTime,
  type AdminPayment,
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

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await adminApi.payments({
        status: statusFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setPayments(data);
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, fromDate, toDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const visiblePayments = payments.filter((p) => {
    const text = `${p.transactionId} ${p.bookingId} ${p.customerName || ""} ${p.paymentMethod}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const totalAmount = visiblePayments.reduce((acc, p) => acc + (p.status === "SUCCESS" ? p.amount : 0), 0);
  const successCount = visiblePayments.filter((p) => p.status === "SUCCESS").length;

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Đối Soát Lịch Sử Thanh Toán
            </h2>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {payments.length} giao dịch ghi nhận
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kiểm toán dòng tiền, đối soát giao dịch cổng thanh toán VNPAY, MoMo, Chuyển khoản ngân hàng (/api/v1/admin/payments).
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
          <span>Làm mới đối soát</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ─── FINANCIAL METRICS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng tiền đối soát</span>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-2 text-emerald-600">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {currency(totalAmount)}
          </p>
          <span className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> Thành công qua cổng thanh toán
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Giao dịch thành công</span>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/50 p-2 text-blue-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {successCount} / {visiblePayments.length}
          </p>
          <span className="mt-1 text-[11px] text-slate-400 font-medium">
            Tỷ lệ thành công: {visiblePayments.length > 0 ? Math.round((successCount / visiblePayments.length) * 100) : 100}%
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cổng chính kết nối</span>
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/50 p-2 text-purple-600">
              <Wallet size={18} />
            </div>
          </div>
          <p className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            VNPAY, MoMo, Chuyển khoản
          </p>
          <span className="mt-1 text-[11px] text-purple-600 font-semibold">
            Tự động cập nhật thời gian thực
          </span>
        </div>
      </div>

      {/* ─── FILTERS BAR ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã GD, mã đơn, khách..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="SUCCESS">Thành công (SUCCESS)</option>
              <option value="PENDING">Chờ xử lý (PENDING)</option>
              <option value="FAILED">Thất bại (FAILED)</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              placeholder="Từ ngày"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div>
            <input
              type="date"
              placeholder="Đến ngày"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
        </div>
      </div>

      {/* ─── DATA TABLE ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
              <TableRow>
                <TableHead className="font-bold text-xs">MÃ GIAO DỊCH</TableHead>
                <TableHead className="font-bold text-xs">MÃ ĐƠN VÉ</TableHead>
                <TableHead className="font-bold text-xs">KHÁCH HÀNG & TUYẾN</TableHead>
                <TableHead className="font-bold text-xs">PHƯƠNG THỨC</TableHead>
                <TableHead className="font-bold text-xs">SỐ TIỀN THANH TOÁN</TableHead>
                <TableHead className="font-bold text-xs">THỜI GIAN GIAO DỊCH</TableHead>
                <TableHead className="font-bold text-xs text-right">TRẠNG THÁI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <RefreshCw size={14} className="animate-spin inline mr-1" />
                    Đang đối soát lịch sử giao dịch...
                  </TableCell>
                </TableRow>
              ) : visiblePayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Không có giao dịch nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                visiblePayments.map((p) => (
                  <TableRow key={p.transactionId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {p.transactionId.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-500">
                        {p.bookingId.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {p.customerName || "Khách hàng"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {p.route || "Chuyến liên tỉnh"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <CreditCard size={12} className="text-blue-500" />
                        {p.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                      {currency(p.amount)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(p.paidAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          p.status === "SUCCESS"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : p.status === "PENDING"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {p.status === "SUCCESS" ? "Thành công" : p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
