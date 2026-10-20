import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CarFront, LockKeyhole } from "lucide-react";
import { getUser, isAuthenticated, login, normalizeAuthUser, saveTokens, saveUser } from "@/services/auth.service";
import { adminErrorMessage } from "@/services/admin.service";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (isAuthenticated() && getUser()?.role === "ADMIN") return <Navigate to="/admin/trips" replace />;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await login({ identifier, password, clientRole: "ADMIN" });
      const user = normalizeAuthUser(response.data.user);
      if (user.role !== "ADMIN" || user.status !== "ACTIVE") throw new Error("Tài khoản Admin chưa hoạt động.");
      saveTokens(response.data.tokens); saveUser(user); navigate("/admin/trips", { replace: true });
    } catch (cause) { setError(adminErrorMessage(cause)); } finally { setBusy(false); }
  };
  return <div className="grid min-h-screen place-items-center bg-[#f5f7fc] px-4 py-10"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
    <Link to="/" className="mb-8 flex items-center gap-3 !no-underline"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-700 text-white"><CarFront/></span><span className="text-xl font-extrabold text-slate-900">GoRide <span className="text-blue-700">Admin</span></span></Link>
    <div className="mb-7"><div className="mb-3 inline-flex rounded-xl bg-blue-50 p-3 text-blue-700"><LockKeyhole size={22}/></div><h1 className="text-2xl font-bold text-slate-900">Đăng nhập quản trị</h1><p className="mt-2 text-sm text-slate-500">Dùng tài khoản Admin để quản lý giá vé và lịch chạy.</p></div>
    <form onSubmit={submit} className="space-y-5"><label className="block text-sm font-semibold">Email hoặc số điện thoại<input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" value={identifier} onChange={e=>setIdentifier(e.target.value)} required/></label><label className="block text-sm font-semibold">Mật khẩu<input type="password" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{busy ? "Đang đăng nhập..." : "Đăng nhập"}</button></form>
    <Link to="/" className="mt-6 block text-center text-sm text-slate-500">Về trang khách hàng</Link>
  </div></div>;
}
