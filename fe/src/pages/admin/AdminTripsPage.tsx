import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, RefreshCw, Search, X } from "lucide-react";
import { adminApi, adminErrorMessage, currency } from "@/services/admin.service";
import type { AdminFare, AdminRoute, AdminTrip, AdminVehicle } from "@/services/admin.service";

const field = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const blank = { routeId: "", vehicleId: "", departureTime: "", price: "" };
const localInput = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const two = (number: number) => String(number).padStart(2, "0");
  const vietnam = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return `${vietnam.getUTCFullYear()}-${two(vietnam.getUTCMonth()+1)}-${two(vietnam.getUTCDate())}T${two(vietnam.getUTCHours())}:${two(vietnam.getUTCMinutes())}`;
};
const vietnamDate = (value: string) => new Date(`${value}:00+07:00`);
const dateLabel = (value: string) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(value));
const statusText = { OPEN: "Đang mở", CLOSED: "Đã đóng", CANCELLED: "Đã hủy" };
const statusColor = { OPEN: "bg-emerald-50 text-emerald-700", CLOSED: "bg-amber-50 text-amber-800", CANCELLED: "bg-red-50 text-red-700" };

export default function AdminTripsPage() {
  const [routes, setRoutes] = useState<AdminRoute[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [fares, setFares] = useState<AdminFare[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [routesData, vehiclesData, faresData, tripsData] = await Promise.all([adminApi.routes(), adminApi.vehicles(), adminApi.fares(), adminApi.trips()]);
      setRoutes(routesData); setVehicles(vehiclesData); setFares(faresData); setTrips(tripsData);
    } catch (cause) { setError(adminErrorMessage(cause)); } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    void Promise.all([adminApi.routes(), adminApi.vehicles(), adminApi.fares(), adminApi.trips()])
      .then(([routesData, vehiclesData, faresData, tripsData]) => {
        if (!active) return;
        setRoutes(routesData); setVehicles(vehiclesData); setFares(faresData); setTrips(tripsData);
      })
      .catch(cause => { if (active) setError(adminErrorMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => trips.filter(trip =>
    (!routeFilter || trip.routeId === routeFilter) &&
    (!dateFilter || localInput(trip.departureTime).slice(0,10) === dateFilter) &&
    (!statusFilter || trip.status === statusFilter) &&
    `${trip.origin} ${trip.destination} ${trip.licensePlate}`.toLocaleLowerCase("vi-VN").includes(search.toLocaleLowerCase("vi-VN")),
  ), [trips, routeFilter, dateFilter, statusFilter, search]);

  const suggestPrice = () => {
    const vehicle = vehicles.find(item => item.vehicleId === form.vehicleId);
    const candidates = fares.filter(fare => fare.routeId === form.routeId && (fare.vehicleTypeId === vehicle?.vehicleTypeId || fare.vehicleTypeId === null));
    const standard = candidates.filter(fare => fare.bookingTypeName.toUpperCase() === "STANDARD");
    const best = (standard.length ? standard : candidates).sort((a,b)=>Number(b.vehicleTypeId !== null)-Number(a.vehicleTypeId !== null))[0];
    if (best) setForm(previous => ({ ...previous, price: String(best.basePrice) }));
    else setError("Chưa có giá vé cho tuyến và loại xe này. Hãy nhập giá chuyến hoặc thiết lập bảng giá trước.");
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!form.departureTime || vietnamDate(form.departureTime).getTime() <= Date.now()) { setError("Giờ khởi hành phải ở trong tương lai."); return; }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) { setError("Giá chuyến phải lớn hơn 0."); return; }
    setBusy(true);
    try {
      const payload = { routeId: form.routeId, vehicleId: form.vehicleId, departureTime: vietnamDate(form.departureTime).toISOString(), price };
      if (editId) { await adminApi.updateTrip(editId, payload); setNotice("Đã cập nhật lịch chuyến."); }
      else { await adminApi.createTrip(payload); setNotice("Đã lên lịch chuyến xe."); }
      setForm(blank); setEditId(null); await load();
    } catch (cause) { setError(adminErrorMessage(cause)); } finally { setBusy(false); }
  };

  const changeStatus = async (trip: AdminTrip, status: AdminTrip["status"]) => {
    if (status === "CANCELLED" && !window.confirm(`Hủy chuyến #${trip.tripId}? Thao tác này không thể hoàn tác.`)) return;
    setBusy(true); setError(""); setNotice("");
    try { await adminApi.updateTripStatus(trip.tripId, status); await load(); setNotice(`Đã chuyển chuyến #${trip.tripId} sang trạng thái ${statusText[status].toLowerCase()}.`); }
    catch (cause) { setError(adminErrorMessage(cause)); } finally { setBusy(false); }
  };

  const startEdit = (trip: AdminTrip) => { setEditId(trip.tripId); setForm({ routeId: trip.routeId, vehicleId: trip.vehicleId, departureTime: localInput(trip.departureTime), price: String(trip.price ?? "") }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800"><CalendarDays size={14}/>Điều phối</div><h1 className="text-3xl font-extrabold tracking-tight">Lịch chạy chuyến xe</h1><p className="mt-2 text-slate-600">Lên lịch, xem chỗ đã đặt và mở, đóng hoặc hủy chuyến.</p></div><button onClick={()=>{setLoading(true);setError("");void load();}} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"><RefreshCw size={16}/>Làm mới</button></div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    {!loading && (routes.length===0 || vehicles.length===0) && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Cần có ít nhất một tuyến đường và một phương tiện đang hoạt động trước khi lên lịch chuyến.</div>}
    <div className="grid gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editId ? `Sửa chuyến #${editId}` : "Lên lịch chuyến mới"}</h2>{editId && <button title="Hủy sửa" onClick={()=>{setEditId(null);setForm(blank);}} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button>}</div>
        <form onSubmit={save} className="space-y-4">
          <label className="block text-sm font-semibold">Tuyến đường<select required className={field} value={form.routeId} onChange={event=>setForm({...form,routeId:event.target.value})}><option value="">Chọn tuyến đường</option>{routes.filter(route=>route.status==="ACTIVE" || route.routeId===form.routeId).map(route=><option key={route.routeId} value={route.routeId}>{route.origin} → {route.destination} ({route.estimatedDuration} phút)</option>)}</select></label>
          <label className="block text-sm font-semibold">Phương tiện<select required className={field} value={form.vehicleId} onChange={event=>setForm({...form,vehicleId:event.target.value})}><option value="">Chọn xe</option>{vehicles.filter(vehicle=>vehicle.status==="ACTIVE" || vehicle.vehicleId===form.vehicleId).map(vehicle=><option key={vehicle.vehicleId} value={vehicle.vehicleId}>{vehicle.licensePlate} · {vehicle.seatCount} ghế{vehicle.vehicleTypeName ? ` · ${vehicle.vehicleTypeName}` : ""}</option>)}</select></label>
          <label className="block text-sm font-semibold">Ngày giờ khởi hành (giờ Việt Nam)<div className="relative"><Clock3 size={17} className="absolute right-3 top-4 text-slate-400"/><input required type="datetime-local" className={field} value={form.departureTime} onChange={event=>setForm({...form,departureTime:event.target.value})}/></div></label>
          <label className="block text-sm font-semibold">Giá chuyến (VND)<input required type="number" min="0.01" max="9999999999.99" step="0.01" className={field} value={form.price} onChange={event=>setForm({...form,price:event.target.value})} placeholder="Ví dụ: 150000"/></label>
          <button type="button" onClick={suggestPrice} disabled={!form.routeId || !form.vehicleId} className="text-sm font-semibold text-blue-700 hover:underline disabled:text-slate-400">Lấy giá gợi ý từ bảng giá vé</button>
          <button disabled={busy || loading} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60">{busy ? "Đang lưu..." : editId ? "Lưu lịch chuyến" : "Lên lịch chuyến"}</button>
        </form>
        <p className="mt-4 text-xs leading-5 text-slate-500">Xe không thể có hai chuyến trùng thời gian. Chuyến đã có khách không thể đổi lịch hoặc hủy trực tiếp.</p>
      </section>
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5"><h2 className="text-lg font-bold">Danh sách chuyến xe</h2><p className="text-sm text-slate-500">{visible.length} chuyến phù hợp</p></div>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input aria-label="Tìm chuyến" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm" placeholder="Tìm tuyến hoặc biển số" value={search} onChange={event=>setSearch(event.target.value)}/></div><select aria-label="Lọc tuyến" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" value={routeFilter} onChange={event=>setRouteFilter(event.target.value)}><option value="">Tất cả tuyến</option>{routes.map(route=><option key={route.routeId} value={route.routeId}>{route.origin} → {route.destination}</option>)}</select><input aria-label="Lọc ngày" type="date" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" value={dateFilter} onChange={event=>setDateFilter(event.target.value)}/><select aria-label="Lọc trạng thái" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}><option value="">Mọi trạng thái</option><option value="OPEN">Đang mở</option><option value="CLOSED">Đã đóng</option><option value="CANCELLED">Đã hủy</option></select></div>
        {loading ? <p className="py-12 text-center text-slate-500">Đang tải lịch chuyến...</p> : visible.length===0 ? <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Chưa có chuyến xe phù hợp. Chọn tuyến, xe và giờ chạy để lên lịch.</div> : <div className="space-y-3">{visible.map(trip=><article key={trip.tripId} className="rounded-xl border border-slate-200 p-4 hover:border-blue-200"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="mb-1 flex items-center gap-2"><strong className="text-base">{trip.origin} → {trip.destination}</strong><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor[trip.status]}`}>{statusText[trip.status]}</span></div><p className="text-sm text-slate-600">#{trip.tripId} · {trip.licensePlate} · {trip.totalSeats} ghế</p></div><div className="text-left sm:text-right"><p className="font-bold text-blue-700">{trip.price === null ? "Chưa có giá" : currency(trip.price)}</p><p className="text-xs text-slate-500">{trip.bookedSeats}/{trip.totalSeats} ghế đã đặt</p></div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3"><span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CalendarDays size={16}/>{dateLabel(trip.departureTime)}</span><div className="flex flex-wrap gap-2">{trip.status!=="CANCELLED" && <><button onClick={()=>startEdit(trip)} className="rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50">Sửa</button>{trip.status==="OPEN" ? <button disabled={busy} onClick={()=>void changeStatus(trip,"CLOSED")} className="rounded-lg px-2 py-1 text-sm font-semibold text-amber-700 hover:bg-amber-50">Đóng đặt chỗ</button> : <button disabled={busy} onClick={()=>void changeStatus(trip,"OPEN")} className="rounded-lg px-2 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Mở đặt chỗ</button>}<button disabled={busy} onClick={()=>void changeStatus(trip,"CANCELLED")} className="rounded-lg px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-50">Hủy chuyến</button></>}</div></div></article>)}</div>}
        <p className="mt-4 text-xs text-slate-500">Hiển thị tối đa 500 chuyến gần nhất. Dùng bộ lọc để tìm nhanh trong danh sách đã tải.</p>
      </section>
    </div>
  </div>;
}
