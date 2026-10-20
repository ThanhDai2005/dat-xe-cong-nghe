import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Tag, Trash2, X } from "lucide-react";
import { adminApi, adminErrorMessage, currency } from "@/services/admin.service";
import type { AdminBookingType, AdminFare, AdminRoute, AdminVehicle, AdminVehicleType } from "@/services/admin.service";

const inputClass = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
const emptyForm = { routeId: "", bookingTypeId: "", vehicleTypeId: "", basePrice: "" };

export default function AdminFaresPage() {
  const [routes, setRoutes] = useState<AdminRoute[]>([]);
  const [bookingTypes, setBookingTypes] = useState<AdminBookingType[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<AdminVehicleType[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [fares, setFares] = useState<AdminFare[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [routeFilter, setRouteFilter] = useState("");
  const [search, setSearch] = useState("");
  const [vehicleTypeName, setVehicleTypeName] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [assignedTypeId, setAssignedTypeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const [routesData, bookingTypesData, vehicleTypesData, vehiclesData, faresData] = await Promise.all([
        adminApi.routes(), adminApi.bookingTypes(), adminApi.vehicleTypes(), adminApi.vehicles(), adminApi.fares(),
      ]);
      setRoutes(routesData); setBookingTypes(bookingTypesData); setVehicleTypes(vehicleTypesData); setVehicles(vehiclesData); setFares(faresData);
    } catch (cause) { setError(adminErrorMessage(cause)); } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    void Promise.all([adminApi.routes(), adminApi.bookingTypes(), adminApi.vehicleTypes(), adminApi.vehicles(), adminApi.fares()])
      .then(([routesData, bookingTypesData, vehicleTypesData, vehiclesData, faresData]) => {
        if (!active) return;
        setRoutes(routesData); setBookingTypes(bookingTypesData); setVehicleTypes(vehicleTypesData); setVehicles(vehiclesData); setFares(faresData);
      })
      .catch(cause => { if (active) setError(adminErrorMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => fares.filter(fare =>
    (!routeFilter || fare.routeId === routeFilter) &&
    `${fare.origin} ${fare.destination} ${fare.bookingTypeName} ${fare.vehicleTypeName || ""}`.toLocaleLowerCase("vi-VN").includes(search.toLocaleLowerCase("vi-VN")),
  ), [fares, routeFilter, search]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    const amount = Number(form.basePrice);
    if (!Number.isFinite(amount) || amount <= 0) { setError("Giá vé phải lớn hơn 0."); return; }
    setBusy(true);
    try {
      if (editId) { await adminApi.updateFare(editId, amount); setNotice("Đã cập nhật giá vé."); }
      else { await adminApi.createFare({ routeId: form.routeId, bookingTypeId: form.bookingTypeId, vehicleTypeId: form.vehicleTypeId || null, basePrice: amount }); setNotice("Đã thêm giá vé."); }
      setForm(emptyForm); setEditId(null); await load();
    } catch (cause) { setError(adminErrorMessage(cause)); } finally { setBusy(false); }
  };

  const addVehicleType = async () => {
    if (!vehicleTypeName.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try { const created = await adminApi.createVehicleType(vehicleTypeName.trim()); setVehicleTypeName(""); setForm(previous => ({ ...previous, vehicleTypeId: created.vehicleTypeId })); await load(); setNotice("Đã thêm loại xe."); }
    catch (cause) { setError(adminErrorMessage(cause)); } finally { setBusy(false); }
  };

  const saveVehicleType = async () => {
    if (!vehicleId) return;
    setBusy(true); setError(""); setNotice("");
    try { await adminApi.assignVehicleType(vehicleId, assignedTypeId || null); await load(); setNotice("Đã gán loại xe cho phương tiện."); }
    catch (cause) { setError(adminErrorMessage(cause)); } finally { setBusy(false); }
  };

  const remove = async (fare: AdminFare) => {
    if (!window.confirm(`Ngừng áp dụng giá ${currency(fare.basePrice)} cho tuyến ${fare.origin} → ${fare.destination}?`)) return;
    setBusy(true); setError(""); setNotice("");
    try { await adminApi.deleteFare(fare.fareId); if (editId === fare.fareId) { setEditId(null); setForm(emptyForm); } await load(); setNotice("Đã ngừng áp dụng giá vé."); }
    catch (cause) { setError(adminErrorMessage(cause)); } finally { setBusy(false); }
  };

  const startEdit = (fare: AdminFare) => { setEditId(fare.fareId); setForm({ routeId: fare.routeId, bookingTypeId: fare.bookingTypeId, vehicleTypeId: fare.vehicleTypeId || "", basePrice: String(fare.basePrice) }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800"><Tag size={14}/>Giá vé</div><h1 className="text-3xl font-extrabold tracking-tight">Thiết lập bảng giá vé</h1><p className="mt-2 text-slate-600">Cấu hình giá theo tuyến, hình thức đặt và loại xe. Giá mới áp dụng cho đơn đặt sau đó.</p></div><button onClick={()=>{setLoading(true);setError("");void load();}} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"><RefreshCw size={16}/>Làm mới</button></div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    {!loading && routes.length===0 && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Chưa có tuyến đường trong hệ thống. Cần tạo tuyến trước khi thiết lập giá vé.</div>}
    <div className="grid gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editId ? "Cập nhật giá vé" : "Thêm giá vé"}</h2>{editId && <button title="Hủy sửa" onClick={()=>{setEditId(null);setForm(emptyForm);}} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button>}</div>
        <form onSubmit={save} className="space-y-4">
          <label className="block text-sm font-semibold">Tuyến đường<select required disabled={!!editId} className={inputClass} value={form.routeId} onChange={event=>setForm({...form,routeId:event.target.value})}><option value="">Chọn tuyến đường</option>{routes.filter(route=>route.status==="ACTIVE" || route.routeId===form.routeId).map(route=><option key={route.routeId} value={route.routeId}>{route.origin} → {route.destination}</option>)}</select></label>
          <label className="block text-sm font-semibold">Hình thức đặt xe<select required disabled={!!editId} className={inputClass} value={form.bookingTypeId} onChange={event=>setForm({...form,bookingTypeId:event.target.value})}><option value="">Chọn hình thức</option>{bookingTypes.filter(type=>type.isActive || type.bookingTypeId===form.bookingTypeId).map(type=><option key={type.bookingTypeId} value={type.bookingTypeId}>{type.typeName}</option>)}</select></label>
          <label className="block text-sm font-semibold">Loại xe<select disabled={!!editId} className={inputClass} value={form.vehicleTypeId} onChange={event=>setForm({...form,vehicleTypeId:event.target.value})}><option value="">Tất cả loại xe</option>{vehicleTypes.filter(type=>type.isActive || type.vehicleTypeId===form.vehicleTypeId).map(type=><option key={type.vehicleTypeId} value={type.vehicleTypeId}>{type.typeName}</option>)}</select></label>
          {!editId && <div className="rounded-xl bg-slate-50 p-3"><p className="mb-2 text-xs font-semibold text-slate-600">Chưa có loại xe phù hợp? Thêm loại xe mới</p><div className="flex gap-2"><input value={vehicleTypeName} onChange={event=>setVehicleTypeName(event.target.value)} placeholder="Ví dụ: Limousine" maxLength={100} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"/><button type="button" disabled={busy || !vehicleTypeName.trim()} onClick={()=>void addVehicleType()} className="rounded-lg border border-blue-300 px-3 text-blue-700 disabled:opacity-50" aria-label="Thêm loại xe"><Plus size={17}/></button></div></div>}
          <label className="block text-sm font-semibold">Giá mỗi ghế (VND)<input required type="number" min="0.01" max="9999999999.99" step="0.01" className={inputClass} value={form.basePrice} onChange={event=>setForm({...form,basePrice:event.target.value})} placeholder="Ví dụ: 150000"/></label>
          <button disabled={busy || loading} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60">{busy ? "Đang lưu..." : editId ? "Lưu thay đổi" : "Thêm giá vé"}</button>
        </form>
        <p className="mt-4 text-xs leading-5 text-slate-500">Giá theo loại xe được ưu tiên; nếu chưa có, hệ thống dùng giá chung của tuyến và hình thức đặt xe.</p>
        <div className="mt-6 border-t border-slate-200 pt-5">
          <h3 className="font-bold">Gán loại xe cho phương tiện</h3>
          <p className="mt-1 text-xs text-slate-500">Chọn loại xe để áp dụng giá riêng khi khách đặt chỗ.</p>
          <label className="mt-4 block text-sm font-semibold">Phương tiện<select className={inputClass} value={vehicleId} onChange={event=>{ const selected=vehicles.find(vehicle=>vehicle.vehicleId===event.target.value); setVehicleId(event.target.value); setAssignedTypeId(selected?.vehicleTypeId || ""); }}><option value="">Chọn xe</option>{vehicles.map(vehicle=><option key={vehicle.vehicleId} value={vehicle.vehicleId}>{vehicle.licensePlate} · {vehicle.seatCount} ghế</option>)}</select></label>
          <label className="mt-3 block text-sm font-semibold">Loại xe áp dụng<select className={inputClass} value={assignedTypeId} onChange={event=>setAssignedTypeId(event.target.value)}><option value="">Chưa gán (dùng giá chung)</option>{vehicleTypes.filter(type=>type.isActive).map(type=><option key={type.vehicleTypeId} value={type.vehicleTypeId}>{type.typeName}</option>)}</select></label>
          <button type="button" disabled={busy || !vehicleId} onClick={()=>void saveVehicleType()} className="mt-3 rounded-xl border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">Lưu loại xe</button>
        </div>
      </section>
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Giá vé đang áp dụng</h2><p className="text-sm text-slate-500">{visible.length} cấu hình</p></div></div>
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]"><div className="relative"><Search size={17} className="absolute left-3 top-3 text-slate-400"/><input aria-label="Tìm giá vé" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tuyến, hình thức, loại xe..." className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm"/></div><select aria-label="Lọc tuyến" value={routeFilter} onChange={e=>setRouteFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Tất cả tuyến</option>{routes.map(route=><option key={route.routeId} value={route.routeId}>{route.origin} → {route.destination}</option>)}</select></div>
        {loading ? <p className="py-12 text-center text-slate-500">Đang tải bảng giá...</p> : visible.length===0 ? <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Chưa có giá vé nào phù hợp. Chọn tuyến và tạo cấu hình ở bên trái.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Tuyến đường</th><th className="px-3 py-3">Hình thức</th><th className="px-3 py-3">Loại xe</th><th className="px-3 py-3 text-right">Giá/ghế</th><th className="px-3 py-3 text-right">Thao tác</th></tr></thead><tbody>{visible.map(fare=><tr key={fare.fareId} className="border-b border-slate-100"><td className="px-3 py-4 font-semibold">{fare.origin} → {fare.destination}</td><td className="px-3 py-4">{fare.bookingTypeName}</td><td className="px-3 py-4 text-slate-600">{fare.vehicleTypeName || "Tất cả"}</td><td className="px-3 py-4 text-right font-bold text-blue-700">{currency(fare.basePrice)}</td><td className="px-3 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={()=>startEdit(fare)} className="rounded-lg px-2 py-1 font-semibold text-blue-700 hover:bg-blue-50">Sửa</button><button disabled={busy} title="Ngừng áp dụng" onClick={()=>void remove(fare)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </div>;
}
