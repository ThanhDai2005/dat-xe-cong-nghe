import { CalendarDays, LogOut, Menu, Tag, X, CarFront } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/admin/fares", title: "Bảng giá vé", icon: Tag },
  { to: "/admin/trips", title: "Lịch chuyến xe", icon: CalendarDays },
];

export default function AdminLayout() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  if (loading || (isAuthenticated && !user)) return <div className="grid min-h-screen place-items-center text-slate-600">Đang kiểm tra tài khoản...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== "ADMIN" || user.status !== "ACTIVE") return <div className="grid min-h-screen place-items-center px-6 text-center"><div><h1 className="text-2xl font-bold">Không có quyền truy cập</h1><p className="mt-2 text-slate-600">Trang này chỉ dành cho tài khoản Admin đang hoạt động.</p><Link to="/admin/login" className="mt-4 inline-block text-blue-700">Đăng nhập tài khoản Admin</Link><span className="mx-2 text-slate-300">·</span><Link to="/" className="text-blue-700">Về trang chủ</Link></div></div>;

  const signOut = () => { logout(); navigate("/admin/login"); };
  return <div className="min-h-screen bg-[#f5f7fc] text-slate-900">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/admin/trips" className="flex items-center gap-3 !no-underline"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-white"><CarFront size={22}/></span><span><span className="block text-lg font-extrabold leading-5 text-slate-950">GoRide</span><span className="text-xs font-semibold tracking-wide text-blue-700">QUẢN TRỊ VẬN HÀNH</span></span></Link>
        <nav className="hidden items-center gap-2 md:flex">{links.map(({to,title,icon:Icon})=><NavLink key={to} to={to} className={({isActive})=>`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold !no-underline ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={17}/>{title}</NavLink>)}</nav>
        <div className="hidden items-center gap-3 md:flex"><span className="max-w-40 truncate text-sm text-slate-600">{user.fullName || user.email}</span><button onClick={signOut} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><LogOut size={16}/>Đăng xuất</button></div>
        <button type="button" className="rounded-lg p-2 md:hidden" aria-label="Mở menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
      </div>
      {open && <nav className="space-y-1 border-t border-slate-100 p-4 md:hidden">{links.map(({to,title})=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className="block rounded-lg px-3 py-2 !no-underline text-slate-800 hover:bg-blue-50">{title}</NavLink>)}<button onClick={signOut} className="px-3 py-2 text-red-600">Đăng xuất</button></nav>}
    </header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Outlet/></main>
  </div>;
}
