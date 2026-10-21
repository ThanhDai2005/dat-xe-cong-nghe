import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Mail,
  ShieldCheck,
  Car,
  LogOut,
  ArrowLeft,
  Calendar,
  Clock,
  KeyRound,
  Edit3,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { customerApi, type CustomerBookingItem } from "@/services/customer.service";
import { updateProfile, changePassword } from "@/services/auth.service";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p || 0);

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "trips">("info");

  // Trips history state
  const [bookings, setBookings] = useState<CustomerBookingItem[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Edit profile state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.fullName || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editBusy, setEditBusy] = useState(false);

  // Change password state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  // Load bookings
  const loadBookings = async () => {
    setLoadingTrips(true);
    try {
      const res = await customerApi.getMyBookings();
      if (res.data) setBookings(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    if (activeTab === "trips") {
      void loadBookings();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất thành công!");
    navigate("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditBusy(true);
    try {
      await updateProfile({ fullName: editFullName.trim(), email: editEmail.trim() });
      toast.success("Cập nhật thông tin thành công!");
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.message || "Cập nhật hồ sơ thất bại");
    } finally {
      setEditBusy(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setPasswordBusy(true);
    try {
      await changePassword({
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setIsPasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Đổi mật khẩu thất bại");
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn gửi yêu cầu hủy vé cho chuyến xe này?")) {
      return;
    }
    try {
      await customerApi.cancelBooking(bookingId, "Khách hàng tự hủy trên hồ sơ cá nhân");
      toast.success("Đã gửi yêu cầu hủy vé thành công");
      await loadBookings();
    } catch (err: any) {
      toast.error(err?.message || "Gửi yêu cầu hủy thất bại");
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0050c8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về Trang chủ
          </Link>
        </div>

        {/* User Overview Card */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0050c8] to-blue-500 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                {user?.fullName ? (
                  user.fullName.trim().charAt(0).toUpperCase()
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {user?.fullName || "Khách hàng GoRide"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {user?.status === "ACTIVE" ? "Đang hoạt động" : "Đã xác minh"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {user?.email || "Chưa cập nhật email"} • {user?.role || "CUSTOMER"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-50 text-red-600 font-semibold text-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 sm:gap-4 mt-8 pt-6 border-t border-slate-100 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "info"
                  ? "bg-[#0050c8] text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("trips")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "trips"
                  ? "bg-[#0050c8] text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Lịch sử chuyến đi {bookings.length > 0 && `(${bookings.length})`}
            </button>
          </div>
        </div>

        {/* Tab 1: Profile Info */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">Chi tiết hồ sơ</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#0050c8]" />
                      Sửa hồ sơ
                    </button>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 block mb-1">
                        Họ và tên
                      </span>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#0050c8]" />
                        {user?.fullName || "Chưa cập nhật"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 block mb-1">
                        Địa chỉ Email
                      </span>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#0050c8]" />
                        {user?.email || "Chưa liên kết"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 block mb-1">
                        Vai trò hệ thống
                      </span>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        {user?.role === "CUSTOMER"
                          ? "Khách hàng"
                          : user?.role === "DRIVER"
                          ? "Tài xế đối tác"
                          : "Quản trị viên"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 block mb-1">
                        Trạng thái tài khoản
                      </span>
                      <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Đang hoạt động bình thường
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar quick actions */}
            <div className="space-y-6">
              <div className="bg-gradient-to-tr from-blue-900 to-[#0050c8] rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block mb-1">
                  Đặc quyền thành viên
                </span>
                <h3 className="text-lg font-black tracking-tight mb-2">Ưu đãi GoRide Rewards</h3>
                <p className="text-xs text-blue-100 leading-relaxed mb-4">
                  Tận hưởng cước phí ưu đãi và ưu tiên đón chuyến trên mọi hành trình của bạn.
                </p>
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 bg-white text-[#0050c8] hover:bg-blue-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Car className="w-4 h-4" />
                  Đặt vé chuyến mới
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Trips */}
        {activeTab === "trips" && (
          <div className="space-y-4">
            {loadingTrips && (
              <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border">
                Đang tải lịch sử chuyến đi của bạn...
              </div>
            )}

            {!loadingTrips && bookings.length === 0 && (
              <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200/80 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0050c8] flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Chưa có lịch sử chuyến đi nào
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                  Khi bạn hoàn thành các chuyến xe cùng GoRide, toàn bộ lộ trình và biên lai điện tử
                  sẽ được lưu tại đây.
                </p>
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 bg-[#0050c8] hover:bg-[#0040a2] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  Khám phá và đặt vé ngay
                </Link>
              </div>
            )}

            {!loadingTrips &&
              bookings.map((b) => {
                const depDate = new Date(b.departureTime);
                const isConfirmed = b.status === "CONFIRMED";
                const isPending = b.status === "PENDING";

                return (
                  <div
                    key={b.bookingId}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-400">
                            Mã đơn: #{b.bookingId.slice(0, 8)}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isConfirmed
                                ? "bg-emerald-100 text-emerald-800"
                                : isPending
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {b.status}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              b.paymentStatus === "PAID"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {b.paymentStatus === "PAID" ? "ĐÃ THANH TOÁN" : "CHỜ THANH TOÁN"}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{b.tripInfo}</h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-[#0050c8]">
                          {formatPrice(b.totalFare)}
                        </span>
                        <span className="text-xs text-slate-400 block">
                          Ghế: {b.seats?.join(", ") || "Chưa gán"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Khởi hành:{" "}
                          {depDate.toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {depDate.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {(isConfirmed || isPending) && (
                        <button
                          onClick={() => handleCancelBooking(b.bookingId)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                        >
                          Yêu cầu hủy chuyến
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal: Sửa hồ sơ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-base font-bold text-slate-900">Chỉnh sửa thông tin cá nhân</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Địa chỉ Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editBusy}
                  className="px-5 py-2 rounded-xl bg-[#0050c8] text-white text-xs font-bold shadow-md"
                >
                  {editBusy ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Đổi mật khẩu */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-base font-bold text-slate-900">Đổi mật khẩu tài khoản</h3>
              <button onClick={() => setIsPasswordModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Mật khẩu mới (ít nhất 6 ký tự)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={passwordBusy}
                  className="px-5 py-2 rounded-xl bg-[#0050c8] text-white text-xs font-bold shadow-md"
                >
                  {passwordBusy ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
