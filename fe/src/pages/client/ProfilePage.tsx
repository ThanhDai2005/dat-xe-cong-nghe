import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Mail,
  ShieldCheck,
  Car,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { LiveTripsPage } from "./LiveBooking";
import { api } from "@/lib/api";
import { getAccessToken, saveUser } from "@/services/auth.service";
import { apiMessage } from "@/services/booking.service";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "trips">("info");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất thành công!");
    navigate("/");
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
                    {user?.status === "ACTIVE"
                      ? "Đang hoạt động"
                      : "Đã xác minh"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {user?.email || "Chưa cập nhật email"} •{" "}
                  {user?.role || "CUSTOMER"}
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
              Lịch sử chuyến đi
            </button>
          </div>
        </div>

        {/* Tab 1: Profile Info */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Chi tiết hồ sơ
                </h2>
                <div className="space-y-4">
                  {user?.role === "CUSTOMER" && <form className="flex flex-wrap items-end gap-3" onSubmit={async e => {
                    e.preventDefault(); setSaving(true);
                    try {
                      await api.patch("/v1/customer/profile", { fullName }, getAccessToken());
                      saveUser({ ...user, fullName: fullName.trim() }); toast.success("Đã cập nhật tên");
                    } catch (error) { toast.error(apiMessage(error)); } finally { setSaving(false); }
                  }}>
                    <label>Họ và tên mới<input className="block rounded-lg border p-2" required minLength={2} maxLength={100} value={fullName} onChange={e => setFullName(e.target.value)} /></label>
                    <button className="rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50" disabled={saving}>Lưu tên</button>
                  </form>}
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
                        Loại tài khoản
                      </span>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        {user?.role === "CUSTOMER"
                          ? "Khách hàng"
                          : user?.role || "Thành viên"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 block mb-1">
                        Trạng thái tài khoản
                      </span>
                      <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Đang hoạt động
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
                <h3 className="text-lg font-black tracking-tight mb-2">
                  Ưu đãi GoRide Rewards
                </h3>
                <p className="text-xs text-blue-100 leading-relaxed mb-4">
                  Tận hưởng cước phí ưu đãi và ưu tiên đón chuyến trên mọi hành
                  trình của bạn.
                </p>
                <Link
                  to="/#booking-card"
                  className="inline-flex items-center gap-2 bg-white text-[#0050c8] hover:bg-blue-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Car className="w-4 h-4" />
                  Đặt xe ngay
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Trips */}
        {activeTab === "trips" && (
          <LiveTripsPage />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
