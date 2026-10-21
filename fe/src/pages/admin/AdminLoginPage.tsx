import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  CarFront,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  getUser,
  isAuthenticated,
  login,
  normalizeAuthUser,
  saveTokens,
  saveUser,
} from "@/services/auth.service";
import { adminErrorMessage } from "@/services/admin.service";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated() && getUser()?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await login({ identifier, password, clientRole: "ADMIN" });
      const user = normalizeAuthUser(response.data.user);
      if (user.role !== "ADMIN" || user.status !== "ACTIVE") {
        throw new Error("Tài khoản chưa có quyền Quản trị viên (ADMIN) hoặc đã bị khóa.");
      }
      saveTokens(response.data.tokens);
      saveUser(user);
      navigate("/admin/dashboard", { replace: true });
    } catch (cause) {
      setError(adminErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const fillDemoAdmin = () => {
    setIdentifier("admin@gmail.com");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* ─── CỘT TRÁI: BRAND SHOWCASE (Shadcn-Admin style) ─────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-12 text-white overflow-hidden">
        {/* Glow circle background */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <CarFront size={24} />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight">GoRide Admin</span>
            <span className="block text-[11px] font-semibold text-blue-300 uppercase tracking-widest">
              Hệ Thống Quản Trị & Vận Hành Xe Công Nghệ
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-sm">
            <Shield size={14} />
            <span>Xác thực RS256 JWT & Chống Brute-force</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Nền tảng điều phối chuyến xe, quản lý biểu cước và đội phương tiện thông minh.
          </h1>
          <p className="text-sm leading-relaxed text-slate-300">
            Cung cấp bức tranh toàn cảnh về hoạt động đặt vé liên tỉnh, tỷ lệ lấp đầy ghế theo thời gian thực và quản trị bảng giá linh hoạt.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Quản lý lịch chuyến xe linh hoạt</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Cấu hình biểu cước theo loại xe</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Phân loại và giám sát đội xe</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Theo dõi đặt chỗ thời gian thực</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} GoRide Transportation Platform. Bảo mật cấp doanh nghiệp.
        </div>
      </div>

      {/* ─── CỘT PHẢI: FORM ĐĂNG NHẬP ────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
              <CarFront size={22} />
            </div>
            <span className="text-xl font-extrabold text-slate-900">
              GoRide <span className="text-blue-600">Admin</span>
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Đăng nhập Quản trị
            </h2>
            <p className="text-xs text-slate-500">
              Nhập thông tin tài khoản được cấp quyền Admin để truy cập hệ thống.
            </p>
          </div>

          {/* Quick Demo Fill Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-600" />
                <span>Điền tài khoản mẫu (admin@gmail.com)</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-blue-500">1-Click</span>
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email hoặc số điện thoại
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  required
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@gmail.com hoặc SĐT"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-all"
            >
              {busy ? "Đang xác thực..." : "Đăng nhập hệ thống"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center dark:border-slate-800">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 !no-underline"
            >
              ← Về Cổng Khách Hàng GoRide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
