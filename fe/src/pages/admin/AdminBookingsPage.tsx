import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Eye,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  Ticket,
  User,
  X,
} from "lucide-react";
import {
  adminApi,
  adminErrorMessage,
  currency,
  formatDateTime,
  type AdminBookingDetail,
  type AdminBookingListItem,
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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Detail Modal
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookingDetail, setBookingDetail] = useState<AdminBookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Cancellation Request Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelRequestedBy, setCancelRequestedBy] = useState("CUSTOMER");
  const [busyCancel, setBusyCancel] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await adminApi.bookings({
        status: statusFilter || undefined,
      });
      setBookings(data);
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const viewDetail = async (id: string) => {
    setSelectedBookingId(id);
    setDetailLoading(true);
    try {
      const detail = await adminApi.bookingDetail(id);
      setBookingDetail(detail);
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRequestCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !cancelReason.trim()) return;
    setBusyCancel(true);
    setError("");
    try {
      await adminApi.requestCancellation({
        bookingId: selectedBookingId,
        requestedBy: cancelRequestedBy,
        reason: cancelReason.trim(),
      });
      setCancelModalOpen(false);
      setCancelReason("");
      setNotice(`Đã tạo yêu cầu hủy chuyến cho đơn #${selectedBookingId}.`);
      await load();
      if (selectedBookingId) {
        await viewDetail(selectedBookingId);
      }
    } catch (err) {
      setError(adminErrorMessage(err));
    } finally {
      setBusyCancel(false);
    }
  };

  const visibleBookings = bookings.filter((b) => {
    const text = `${b.bookingId} ${b.customerName} ${b.contactPhone || ""} ${b.tripInfo}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Quản Lý Đơn Đặt Chuyến
            </h2>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 border-blue-200 bg-blue-50/50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {bookings.length} đơn đặt chỗ
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Theo dõi hành trình, kiểm soát trạng thái ghế, tình trạng thanh toán và chi tiết hành khách (/api/v1/admin/bookings).
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
          <span>Làm mới danh sách</span>
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

      {/* ─── FILTER TABS & SEARCH BAR ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
          {[
            { label: "Tất cả", val: "" },
            { label: "Đã xác nhận (CONFIRMED)", val: "CONFIRMED" },
            { label: "Chờ thanh toán (PENDING)", val: "PENDING" },
            { label: "Đã hủy (CANCELLED)", val: "CANCELLED" },
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              onClick={() => setStatusFilter(tab.val)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                statusFilter === tab.val
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px] flex-1 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo khách, SĐT, mã đơn..."
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
      </div>

      {/* ─── DATA TABLE ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50">
              <TableRow>
                <TableHead className="font-bold text-xs">MÃ ĐƠN</TableHead>
                <TableHead className="font-bold text-xs">KHÁCH HÀNG</TableHead>
                <TableHead className="font-bold text-xs">HÀNH TRÌNH & THỜI GIAN</TableHead>
                <TableHead className="font-bold text-xs">GHẾ ĐÃ ĐẶT</TableHead>
                <TableHead className="font-bold text-xs">TỔNG CƯỚC</TableHead>
                <TableHead className="font-bold text-xs">TRẠNG THÁI</TableHead>
                <TableHead className="font-bold text-xs">THANH TOÁN</TableHead>
                <TableHead className="font-bold text-xs text-right">CHI TIẾT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    <RefreshCw size={14} className="animate-spin inline mr-1" />
                    Đang tải danh sách đơn đặt chuyến...
                  </TableCell>
                </TableRow>
              ) : visibleBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    Không có đơn đặt chuyến nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                visibleBookings.map((b) => (
                  <TableRow key={b.bookingId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {b.bookingId.slice(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {b.customerName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {b.contactPhone || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {b.tripInfo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {b.seats && b.seats.length > 0 ? (
                          b.seats.map((seat) => (
                            <span
                              key={seat}
                              className="rounded bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 font-mono text-[11px] font-bold text-blue-700 dark:text-blue-300"
                            >
                              {seat}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">1 vé</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                      {currency(b.totalFare)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : b.status === "PENDING"
                            ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          b.paymentStatus === "PAID"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : b.paymentStatus === "REFUNDED"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {b.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => void viewDetail(b.bookingId)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 transition-colors"
                      >
                        <Eye size={13} />
                        <span>Xem</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── BOOKING DETAIL MODAL ────────────────────────────────────────── */}
      {selectedBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Ticket size={18} className="text-blue-600" />
                  Chi Tiết Đơn Đặt Vé #{selectedBookingId}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thông tin hồ sơ khách hàng, chi tiết chuyến đi và đối soát thanh toán.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {detailLoading || !bookingDetail ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <RefreshCw size={16} className="animate-spin inline mr-2" />
                  Đang tải thông tin chi tiết đơn...
                </div>
              ) : (
                <>
                  {/* Customer Card */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                      <User size={15} className="text-blue-600" />
                      Thông Tin Khách Hàng
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Họ và tên:</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {bookingDetail.customerDetails.customerName || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Số điện thoại liên hệ:</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {bookingDetail.customerDetails.contactPhone || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Địa chỉ đón:</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {bookingDetail.customerDetails.pickupAddress || "Điểm đón trung tâm"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Địa chỉ trả:</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {bookingDetail.customerDetails.dropoffAddress || "Điểm trả trung tâm"}
                        </p>
                      </div>
                      {bookingDetail.customerDetails.driverNote && (
                        <div className="col-span-2">
                          <span className="text-slate-400 text-[11px]">Ghi chú cho tài xế:</span>
                          <p className="italic text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 mt-1">
                            "{bookingDetail.customerDetails.driverNote}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trip Card */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                      <MapPin size={15} className="text-emerald-600" />
                      Hành Trình & Phương Tiện
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Tuyến vận hành:</span>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                          {bookingDetail.tripDetails.origin}
                          <ArrowRight size={13} className="text-slate-400" />
                          {bookingDetail.tripDetails.destination}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Thời gian khởi hành:</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {formatDateTime(bookingDetail.tripDetails.departureTime)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Phương tiện & Biển số:</span>
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {bookingDetail.tripDetails.licensePlate} ({bookingDetail.tripDetails.vehicleTypeName || "Tiêu chuẩn"})
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Vị trí ghế đã chọn:</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {bookingDetail.tripDetails.seats.map((st) => (
                            <span key={st} className="rounded bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 font-bold font-mono text-blue-700 dark:text-blue-300">
                              Ghế {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Card */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                      <CreditCard size={15} className="text-purple-600" />
                      Chi Tiết Thanh Toán & Cước Phí
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Tổng cước vé:</span>
                        <p className="text-base font-black text-slate-900 dark:text-white">
                          {currency(bookingDetail.paymentDetails.totalFare)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Phương thức:</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {bookingDetail.paymentDetails.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Trạng thái thanh toán:</span>
                        <div className="mt-0.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              bookingDetail.paymentDetails.paymentStatus === "PAID"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {bookingDetail.paymentDetails.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-b-2xl">
              {bookingDetail && bookingDetail.paymentDetails.bookingStatus !== "CANCELLED" ? (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:bg-slate-900"
                >
                  <RotateCcw size={13} />
                  <span>Yêu cầu hủy chuyến</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedBookingId(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REQUEST CANCELLATION MODAL ──────────────────────────────────── */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Ghi Nhận Yêu Cầu Hủy Chuyến
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Yêu cầu hủy cho đơn vé <strong>#{selectedBookingId}</strong> (/api/v1/admin/cancellations/request).
            </p>

            <form onSubmit={handleRequestCancellation} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Người yêu cầu *
                </label>
                <select
                  value={cancelRequestedBy}
                  onChange={(e) => setCancelRequestedBy(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="CUSTOMER">Khách hàng yêu cầu (CUSTOMER)</option>
                  <option value="ADMIN">Quản trị viên / Nhà xe điều phối (ADMIN)</option>
                  <option value="FORCE_MAJEURE">Bất khả kháng / Sự cố xe (FORCE_MAJEURE)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lý do hủy chuyến chi tiết *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi rõ lý do hủy của khách hàng hoặc sự cố..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={busyCancel}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-700 disabled:opacity-50"
                >
                  {busyCancel ? "Đang gửi..." : "Ghi nhận hủy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
