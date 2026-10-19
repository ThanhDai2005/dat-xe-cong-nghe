import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Car,
  User,
  LogOut,
  ChevronRight,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { label: "Trang chủ", to: "/" },
  { label: "Đặt xe", to: "/booking" },
  { label: "Dịch vụ", to: "/services" },
  { label: "Bảng giá", to: "/fares" },
  { label: "Hỗ trợ", to: "/support" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const getInitial = () => {
    const name = user?.fullName?.trim();
    return name ? name.charAt(0).toUpperCase() : null;
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      toast.success("Đã đăng xuất thành công!");
      navigate("/");
    } catch {
      toast.error("Đăng xuất không thành công. Vui lòng thử lại.");
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "relative whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
      isActive
        ? "bg-green-50 text-green-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-green-700",
    ].join(" ");

  const renderAvatar = (large = false) => (
    <span
      className={[
        "flex shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700",
        large ? "h-12 w-12 text-lg" : "h-10 w-10 text-base",
      ].join(" ")}
    >
      {getInitial() || <User size={large ? 22 : 19} />}
    </span>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md">
      <nav
        className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10"
        aria-label="Điều hướng chính"
      >
        {/* LOGO */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="GoRide - Trang chủ"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20 transition-transform duration-200 group-hover:scale-105">
            <Car size={25} strokeWidth={2.4} />
          </span>

          <span className="text-[25px] font-extrabold tracking-tight text-slate-900">
            Go<span className="text-green-600">Ride</span>
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={navLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* TÀI KHOẢN DESKTOP */}
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="group flex items-center gap-2.5 rounded-2xl p-1.5 pr-3 transition-colors hover:bg-green-50"
              >
                {renderAvatar()}

                <span className="hidden max-w-[145px] flex-col lg:flex">
                  <span className="truncate text-sm font-bold text-slate-800">
                    {user?.fullName?.trim() || "Tài khoản"}
                  </span>
                  <span className="text-xs text-slate-500">
                    Hồ sơ cá nhân
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={17} />
                <span className="hidden lg:inline">Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3",
                    "text-sm font-bold no-underline",
                    "transition-all duration-300 ease-out",
                    "focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2",
                    isActive
                      ? "bg-green-800 text-white shadow-inner ring-2 ring-green-200"
                      : "bg-[#00B14F] text-white shadow-md shadow-green-600/20 hover:-translate-y-0.5 hover:bg-[#009944] hover:shadow-lg hover:shadow-green-600/30 active:translate-y-0 active:scale-95",
                  ].join(" ")
                }
              >
                <User size={18} />
                <span>Đăng nhập</span>
              </NavLink>

            </>
          )}
        </div>

        {/* NÚT MENU MOBILE */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 sm:hidden"
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="goride-mobile-menu"
        >
          {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      {/* MENU MOBILE */}
      <div
        id="goride-mobile-menu"
        className={[
          "overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 sm:hidden",
          mobileMenuOpen
            ? "visible max-h-[650px] opacity-100"
            : "invisible max-h-0 border-transparent opacity-0",
        ].join(" ")}
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
      >
        <div className="mx-auto max-w-[1440px] px-4 pb-5 pt-3 sm:px-6">
          {/* Liên kết điều hướng */}
          <div className="flex flex-col gap-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    "flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-green-700",
                  ].join(" ")
                }
              >
                {item.label}
                <ChevronRight size={17} />
              </NavLink>
            ))}
          </div>

          <div className="my-4 border-t border-slate-100" />

          {/* KHU VỰC TÀI KHOẢN */}
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4">
                {renderAvatar(true)}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900">
                    {user?.fullName?.trim() || "Khách hàng"}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {user?.email || "Tài khoản GoRide"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-xl border border-green-200 px-3 py-3 text-sm font-bold text-green-700 transition-colors hover:bg-green-50"
                >
                  <UserRound size={17} />
                  Hồ sơ
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center rounded-xl border border-green-600 px-4 py-3 text-sm font-bold text-green-700 transition-colors hover:bg-green-50"
              >
                Đăng nhập
              </Link>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
