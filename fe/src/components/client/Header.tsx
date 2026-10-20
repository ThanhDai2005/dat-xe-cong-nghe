import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  CarFront,
  User,
  LogOut,
  ChevronRight,
  UserRound,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Trang chủ", path: "/" },
  { name: "Đặt xe", path: "/booking" },
  { name: "Dịch vụ", path: "/services" },
  { name: "Bảng giá", path: "/fares" },
  { name: "Hỗ trợ", path: "/support" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      toast.success("Đăng xuất thành công!");
      navigate("/");
    } catch {
      toast.error("Không thể đăng xuất. Vui lòng thử lại!");
    }
  };

  // Menu không gạch chân, vẫn giữ hiệu ứng hover
  const navLinkClass = (isActive: boolean) =>
    `inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold
    !no-underline transition-all duration-200 ease-out
    ${
      isActive
        ? "text-blue-600"
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <nav className="flex min-h-[72px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* LOGO */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          aria-label="GoRide - Trang chủ"
          className="group flex shrink-0 items-center gap-2.5 !no-underline"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 transition-all duration-300 group-hover:-rotate-3 group-hover:scale-105 group-hover:bg-blue-700">
            <CarFront size={25} strokeWidth={2.4} />
          </span>

          <span className="text-2xl font-extrabold tracking-tight text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
            Go<span className="text-blue-600">Ride</span>
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden items-center gap-1 md:flex lg:gap-2">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `${navLinkClass(isActive)} hover:!no-underline`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* TÀI KHOẢN DESKTOP */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="group flex items-center gap-2 rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-blue-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
                  <UserRound size={19} />
                </span>

                <span className="max-w-[130px] truncate text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                  {user?.fullName ||
                    user?.email ||
                    "Tài khoản"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
              >
                <LogOut size={17} />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 !no-underline transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:!no-underline active:scale-95"
              >
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white !no-underline shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:!no-underline hover:shadow-lg hover:shadow-blue-200 active:translate-y-0 active:scale-95"
              >
                Đăng ký
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </>
          )}
        </div>

        {/* NÚT MENU MOBILE */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 md:hidden"
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      {/* MENU MOBILE */}
      <div
        className={`grid border-t border-gray-100 bg-white transition-[grid-template-rows,opacity] duration-300 ease-in-out md:hidden ${
          mobileMenuOpen
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold !no-underline transition-all duration-200 hover:!no-underline ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:translate-x-1 hover:bg-gray-50 hover:text-blue-600"
                  }`
                }
              >
                {item.name}
                <ChevronRight size={17} className="opacity-60" />
              </NavLink>
            ))}

            <div className="mt-3 border-t border-gray-100 pt-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User size={20} />
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Xin chào</p>
                      <p className="truncate text-sm font-bold text-gray-800">
                        {user?.fullName ||
                          user?.email ||
                          "Tài khoản"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 !no-underline transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:!no-underline"
                  >
                    Đăng nhập
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white !no-underline transition-all duration-200 hover:bg-blue-700 hover:!no-underline active:scale-95"
                  >
                    Đăng ký
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
