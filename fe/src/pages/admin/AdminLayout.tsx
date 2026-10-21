import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  BookmarkCheck,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronsUpDown,
  Command,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  PanelLeft,
  RotateCcw,
  Search as SearchIcon,
  Settings,
  ShieldCheck,
  Sun,
  Tag,
  Ticket,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { adminApi, type AdminProfile } from "@/services/admin.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const topNavLinks = [
  { title: "Tổng quan", href: "/admin/dashboard" },
  { title: "Chuyến xe", href: "/admin/trips" },
  { title: "Đơn đặt chỗ", href: "/admin/bookings" },
  { title: "Tuyến đường", href: "/admin/routes" },
  { title: "Đối soát GD", href: "/admin/payments" },
  { title: "Hủy & Hoàn tiền", href: "/admin/cancellations" },
];

type NavItem = {
  title: string;
  url: string;
  icon: any;
  external?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "TỔNG QUAN",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "VẬN HÀNH & TUYẾN",
    items: [
      { title: "Lịch chuyến xe", url: "/admin/trips", icon: CalendarDays },
      { title: "Tuyến đường & Điểm dừng", url: "/admin/routes", icon: MapPin },
      { title: "Phương tiện (Xe)", url: "/admin/vehicles", icon: CarFront },
    ],
  },
  {
    title: "KINH DOANH & GIÁ CƯỚC",
    items: [
      { title: "Bảng giá cước", url: "/admin/fares", icon: Tag },
      { title: "Hình thức đặt xe", url: "/admin/booking-types", icon: BookmarkCheck },
    ],
  },
  {
    title: "ĐƠN ĐẶT & KHÁCH HÀNG",
    items: [
      { title: "Quản lý đơn đặt chuyến", url: "/admin/bookings", icon: Ticket },
    ],
  },
  {
    title: "TÀI CHÍNH & VẬN HÀNH",
    items: [
      { title: "Đối soát thanh toán", url: "/admin/payments", icon: CreditCard },
      { title: "Hủy chuyến & Hoàn tiền", url: "/admin/cancellations", icon: RotateCcw },
    ],
  },
  {
    title: "LIÊN KẾT",
    items: [
      { title: "Cổng Khách Hàng", url: "/", icon: ExternalLink, external: true },
    ],
  },
];

export default function AdminLayout() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      adminApi.me().then(setAdminProfile).catch(() => null);
    }
  }, [isAuthenticated, user]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  if (loading || (isAuthenticated && !user)) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-white" />
          <p className="text-sm font-medium">Đang tải GoRide Admin Enterprise...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  if (user?.role !== "ADMIN" || user.status !== "ACTIVE") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-red-100 text-red-600">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quyền Truy Cập Bị Từ Chối</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Trang này chỉ dành cho tài khoản Quản trị viên (ADMIN) đang hoạt động.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/admin/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Đăng nhập tài khoản Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const signOut = () => {
    logout();
    navigate("/admin/login");
  };

  const displayName = adminProfile?.fullName || user.fullName || "Admin Vận Hành";
  const displayEmail = adminProfile?.email || user.email || "admin@goride.vn";

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* ─── SIDEBAR DESKTOP ────────────────────────────────────────────── */}
      <aside
        className={`hidden border-r border-border bg-sidebar transition-all duration-300 md:flex md:flex-col ${
          sidebarOpen ? "w-64" : "w-18"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Link
            to="/admin/dashboard"
            className="flex w-full items-center gap-3 overflow-hidden rounded-lg p-1.5 hover:bg-sidebar-accent !no-underline"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-slate-950 to-blue-700 text-white shadow-md">
              <Command size={18} />
            </div>
            {sidebarOpen && (
              <div className="flex flex-1 items-center justify-between overflow-hidden">
                <div className="flex flex-col text-left">
                  <span className="truncate text-sm font-bold tracking-tight text-sidebar-foreground flex items-center gap-1.5">
                    GoRide Admin
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Hệ thống trực tuyến" />
                  </span>
                  <span className="truncate text-[11px] font-medium text-muted-foreground">
                    Management Suite
                  </span>
                </div>
                <ChevronsUpDown size={14} className="text-muted-foreground shrink-0" />
              </div>
            )}
          </Link>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {sidebarOpen && (
                <div className="px-3 pb-1.5 text-[10px] font-bold text-muted-foreground/80 tracking-wider">
                  {group.title}
                </div>
              )}
              {group.items.map(({ title, url, icon: Icon, external }) => (
                <NavLink
                  key={title}
                  to={url}
                  target={external ? "_blank" : undefined}
                  title={!sidebarOpen ? title : undefined}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 !no-underline ${
                      isActive && !external
                        ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    } ${!sidebarOpen ? "justify-center px-0" : ""}`
                  }
                >
                  <Icon size={17} className="shrink-0" />
                  {sidebarOpen && <span className="truncate">{title}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* NavUser Footer */}
        <div className="border-t border-sidebar-border p-3 relative">
          <div
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent cursor-pointer transition-colors"
          >
            <Avatar className="h-8 w-8 rounded-lg border border-border">
              <AvatarFallback className="rounded-lg bg-blue-600/10 text-blue-600 font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex flex-1 items-center justify-between overflow-hidden text-left">
                <div className="flex flex-col truncate">
                  <span className="truncate text-xs font-semibold text-sidebar-foreground leading-tight">
                    {displayName}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {displayEmail}
                  </span>
                </div>
                <ChevronsUpDown size={14} className="text-muted-foreground shrink-0" />
              </div>
            )}
          </div>

          {/* User Popover Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute bottom-16 left-3 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl z-50 text-popover-foreground">
              <div className="px-3 py-2 text-xs font-medium border-b border-border/80">
                <p className="font-bold text-foreground">{displayName}</p>
                <p className="text-muted-foreground text-[11px] truncate">{displayEmail}</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={10} /> Quản trị viên
                </span>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate("/admin/dashboard");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent text-left font-medium"
                >
                  <User size={14} />
                  <span>Hồ sơ Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate("/admin/dashboard");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent text-left font-medium"
                >
                  <Settings size={14} />
                  <span>Cài đặt hệ thống</span>
                </button>
              </div>
              <div className="border-t border-border/80 pt-1">
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-left font-medium"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border text-foreground hover:bg-accent md:hidden"
          >
            <Menu size={18} />
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-foreground md:grid"
            title="Đóng/Mở thanh điều hướng"
          >
            <PanelLeft size={16} />
          </button>

          {/* Breadcrumb / Top Quick Links */}
          <nav className="hidden lg:flex items-center gap-4 text-xs font-medium ml-2">
            {topNavLinks.map((item) => {
              const active = location.pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={`transition-colors py-1 px-2.5 rounded-lg !no-underline ${
                    active
                      ? "bg-slate-100 font-bold text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  {item.title}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Header items */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Quick search input */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <SearchIcon size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="w-full rounded-xl border border-input bg-muted/40 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-background transition-all"
              />
            </div>

            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-8 w-8 place-items-center rounded-xl border border-border text-foreground hover:bg-accent transition-colors"
              title="Đổi giao diện Sáng / Tối"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={signOut}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors"
            >
              <LogOut size={13} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6 lg:p-8 dark:bg-slate-950/40">
          <Outlet />
        </main>
      </div>

      {/* ─── MOBILE DRAWER MENU ────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-72 flex-col bg-background p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Command size={18} />
                <span>GoRide Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 flex-1 space-y-6 overflow-y-auto">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-bold text-muted-foreground">
                    {group.title}
                  </div>
                  {group.items.map(({ title, url, icon: Icon, external }) => (
                    <NavLink
                      key={title}
                      to={url}
                      target={external ? "_blank" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold !no-underline ${
                          isActive && !external
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`
                      }
                    >
                      <Icon size={16} />
                      <span>{title}</span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
