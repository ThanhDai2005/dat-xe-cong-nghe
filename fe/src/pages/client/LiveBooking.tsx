import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import GoogleMapLocationPicker from "@/components/client/GoogleMapLocationPicker";
import { bookingApi, apiMessage, statusLabels } from "@/services/booking.service";
import type { Booking, Contact, Place, Quote, QuoteInput } from "@/services/booking.service";

const field = "w-full rounded-xl border border-slate-300 p-3 mt-1";
const button = "rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50";
const vnd = (amount: string | number) => Number(amount).toLocaleString("vi-VN") + " ₫";
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <main className="mx-auto max-w-3xl p-5 sm:p-8 space-y-5">
    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>{children}
  </main>;
}
function ErrorBox({ message }: { message: string }) {
  return message ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{message} <Link className="underline" to="/login?redirect=/booking">Đăng nhập</Link></div> : null;
}
function PlaceInput({ label, value, onChange }: { label: string; value: Partial<Place>; onChange: (p: Partial<Place>) => void }) {
  if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) return <GoogleMapLocationPicker label={label} placeholder={`Chọn ${label.toLowerCase()}`}
    value={value.address || ""} onChange={(address, position) => onChange({ address, ...position })} />;
  if (import.meta.env.VITE_ALLOW_MANUAL_COORDINATES !== "true") return <p role="alert">Chưa cấu hình Google Maps phía trình duyệt; chưa thể chọn {label.toLowerCase()}.</p>;
  return <fieldset className="rounded-xl border p-4"><legend>{label} — nhập tọa độ kiểm thử local</legend>
    <label>Địa chỉ {label.toLowerCase()}<input className={field} required minLength={3} maxLength={255} value={value.address || ""}
      onChange={e => onChange({ ...value, address: e.target.value })} /></label>
    <div className="grid grid-cols-2 gap-3 mt-3">
      <label>Vĩ độ {label.toLowerCase()}<input className={field} type="number" step="any" min="-90" max="90" required value={value.lat ?? ""}
        onChange={e => onChange({ ...value, lat: e.target.value === "" ? undefined : Number(e.target.value) })} /></label>
      <label>Kinh độ {label.toLowerCase()}<input className={field} type="number" step="any" min="-179.999999" max="180" required value={value.lng ?? ""}
        onChange={e => onChange({ ...value, lng: e.target.value === "" ? undefined : Number(e.target.value) })} /></label>
    </div>
  </fieldset>;
}
type Draft = { input: QuoteInput; contact: Contact; quote: Quote; operationKey: string; userId: string };
export function LiveBookingPage() {
  const { user, isAuthenticated } = useAuth(), navigate = useNavigate();
  const [pickup, setPickup] = useState<Partial<Place>>({}), [destination, setDestination] = useState<Partial<Place>>({});
  const [departure, setDeparture] = useState(""), [seats, setSeats] = useState(1);
  const [name, setName] = useState(user?.fullName || ""), [phone, setPhone] = useState(user?.phone || ""), [note, setNote] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  if (!isAuthenticated) return <Navigate to="/login?redirect=/booking" replace />;
  if (user?.role !== "CUSTOMER") return <Panel title="Đặt xe"><p>Vui lòng dùng tài khoản khách hàng.</p></Panel>;
  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (![pickup.lat, pickup.lng, destination.lat, destination.lng].every(v => typeof v === "number" && Number.isFinite(v))) {
      setError("Hãy chọn cả hai địa điểm trên bản đồ để lấy tọa độ."); return;
    }
    const time = new Date(departure);
    if (!Number.isFinite(time.getTime()) || time.getTime() < Date.now() + 5 * 3600000) {
      setError("Giờ khởi hành phải cách hiện tại ít nhất 5 giờ."); return;
    }
    setBusy(true);
    try {
      const input: QuoteInput = { pickup: pickup as Place, destination: destination as Place, departureAt: time.toISOString(), seatCount: seats };
      const result = await bookingApi.quote(input);
      navigate("/booking/confirm", { state: { input, quote: result.data, contact: { contactName: name, contactPhone: phone, note },
        operationKey: crypto.randomUUID(), userId: user!.id } satisfies Draft });
    } catch (e) { setError(apiMessage(e)); } finally { setBusy(false); }
  }
  return <Panel title="Tạo yêu cầu đặt xe">
    <p>Đặt trước ít nhất 5 giờ. Tài xế tự nhận yêu cầu; thanh toán trực tiếp cho tài xế.</p>
    <form onSubmit={submit} className="space-y-5">
      <PlaceInput label="Điểm đón" value={pickup} onChange={setPickup} />
      <PlaceInput label="Điểm đến" value={destination} onChange={setDestination} />
      <label className="block">Giờ khởi hành (giờ địa phương)<input className={field} type="datetime-local" required value={departure} onChange={e => setDeparture(e.target.value)} /></label>
      <label className="block">Số khách<select className={field} value={seats} onChange={e => setSeats(Number(e.target.value))}>
        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} khách</option>)}</select></label>
      <label className="block">Tên liên hệ<input className={field} required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="block">Số điện thoại liên hệ<input className={field} type="tel" required value={phone} onChange={e => setPhone(e.target.value)} /></label>
      <label className="block">Ghi chú<textarea className={field} maxLength={500} value={note} onChange={e => setNote(e.target.value)} /></label>
      <ErrorBox message={error} /><button className={button} disabled={busy}>{busy ? "Đang lấy báo giá…" : "Lấy báo giá"}</button>
    </form>
  </Panel>;
}
export function LiveBookingConfirmPage() {
  const { state } = useLocation(), { user } = useAuth(), navigate = useNavigate();
  const draft = state as Draft | null;
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const inFlight = useRef(false);
  if (!draft?.quote?.quoteId || draft.userId !== user?.id) return <Panel title="Chưa có báo giá"><Link to="/booking">Quay lại đặt xe</Link></Panel>;
  const { quote, input, contact } = draft;
  async function confirm() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      const result = await bookingApi.create(quote.quoteId, contact, draft!.operationKey);
      navigate(`/booking/success/${result.data.bookingId}`, { replace: true });
    } catch (e) { setError(apiMessage(e)); } finally { setBusy(false); inFlight.current = false; }
  }
  return <Panel title="Xác nhận yêu cầu">
    {quote.provider === "mock" && <p role="status" className="bg-amber-100 p-4 rounded-xl">BÁO GIÁ GIẢ LẬP LOCAL — không phải khoảng cách/giá thực tế.</p>}
    <p>{input.pickup.address} → {input.destination.address}</p>
    <p>{new Date(input.departureAt).toLocaleString("vi-VN")} · {input.seatCount} khách</p>
    <p>{contact.contactName} · {contact.contactPhone}</p>
    <p>Khoảng cách: {(quote.distanceMeters / 1000).toLocaleString("vi-VN")} km</p>
    <p>Đơn giá: {vnd(quote.farePerSeat)}/khách · Tổng: {vnd(quote.totalFare)}</p>
    <p className="font-bold">Tiền mặt làm tròn: {vnd(quote.cashTotal)}</p>
    <p>Trả trực tiếp cho tài xế. Chưa thu tiền khi tạo yêu cầu.</p>
    <p>Báo giá hết hạn lúc {new Date(quote.expiresAt).toLocaleTimeString("vi-VN")}.</p>
    <ErrorBox message={error} />
    <div className="flex gap-4 items-center"><Link to="/booking">Đặt lại</Link>
      <button className={button} disabled={busy} onClick={confirm}>{busy ? "Đang tạo yêu cầu…" : "Xác nhận đặt xe"}</button></div>
  </Panel>;
}
export function LiveTripsPage() {
  const [items, setItems] = useState<Booking[]>([]), [status, setStatus] = useState(""), [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const generation = useRef(0);
  useEffect(() => {
    const version = ++generation.current;
    setBusy(true); setError(""); setItems([]); setCursor(null);
    bookingApi.list(status).then(r => {
      if (generation.current === version) { setItems(r.data.items); setCursor(r.data.nextCursor); }
    }).catch(e => { if (generation.current === version) setError(apiMessage(e)); })
      .finally(() => { if (generation.current === version) setBusy(false); });
    return () => { generation.current++; };
  }, [status]);
  async function more() {
    if (!cursor || busy) return;
    const version = generation.current; setBusy(true); setError("");
    try { const r = await bookingApi.list(status, cursor);
      if (generation.current === version) { setItems(prev => [...prev, ...r.data.items]); setCursor(r.data.nextCursor); }
    } catch (e) { if (generation.current === version) setError(apiMessage(e)); }
    finally { if (generation.current === version) setBusy(false); }
  }
  return <Panel title="Chuyến của tôi">
    <Link to="/booking">+ Đặt xe mới</Link>
    <label className="block">Trạng thái<select className={field} value={status} onChange={e => setStatus(e.target.value)}>
      <option value="">Tất cả</option>{Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
    <ErrorBox message={error} />
    {!busy && !items.length && !error && <p>Chưa có yêu cầu phù hợp.</p>}
    {items.map(b => <Link key={b.id} to={`/trip/${b.id}`} className="block rounded-xl border p-4">
      <strong>#{b.id} · {statusLabels[b.status] || b.status}</strong>
      <p>{b.pickup.address} → {b.destination.address}</p><p>{new Date(b.departureAt).toLocaleString("vi-VN")} · {vnd(b.totalFare)}</p>
    </Link>)}
    {busy && <p role="status">Đang tải…</p>}
    {cursor && <button className={button} disabled={busy} onClick={more}>Xem thêm</button>}
  </Panel>;
}
export function LiveTripDetailPage() {
  const { tripId = "" } = useParams(), location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(null), [error, setError] = useState(""), [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const cancelOperation = useRef<{ id: string; reason: string; key: string } | null>(null);
  useEffect(() => {
    let active = true; setBooking(null); setError("");
    bookingApi.detail(tripId).then(r => { if (active) setBooking(r.data); }).catch(e => { if (active) setError(apiMessage(e)); });
    return () => { active = false; };
  }, [tripId]);
  async function cancel(e: FormEvent) {
    e.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    if (cancelOperation.current?.id !== tripId || cancelOperation.current.reason !== reason) {
      cancelOperation.current = { id: tripId, reason, key: crypto.randomUUID() };
    }
    try {
      await bookingApi.cancel(tripId, reason, cancelOperation.current.key);
      const r = await bookingApi.detail(tripId); setBooking(r.data);
    } catch (e) { setError(apiMessage(e)); } finally { setBusy(false); }
  }
  return <Panel title={location.pathname.startsWith("/booking/success/") ? "Đã tạo yêu cầu đặt xe" : "Chi tiết chuyến"}>
    <Link to="/trips">← Chuyến của tôi</Link><ErrorBox message={error} />
    {!booking && !error && <p>Đang tải…</p>}
    {booking && <>
      <h2 className="text-xl font-bold">#{booking.id} · {statusLabels[booking.status] || booking.status}</h2>
      {booking.provider === "mock" && <p className="bg-amber-100 p-3">Đơn kiểm thử với báo giá giả lập.</p>}
      <p>{booking.pickup.address} → {booking.destination.address}</p>
      <p>{new Date(booking.departureAt).toLocaleString("vi-VN")} · {booking.seatCount} khách</p>
      <p>Tổng: {vnd(booking.totalFare)} · Tiền mặt làm tròn: {vnd(booking.cashTotal)}</p>
      <p>Liên hệ: {booking.contactName} · {booking.contactPhone}</p>
      <p>{booking.note}</p>
      <p>{booking.driver ? `Tài xế: ${booking.driver.name} · ${booking.driver.phone} · ${booking.driver.licensePlate}` : "Chưa có tài xế nhận yêu cầu."}</p>
      {booking.status === "OPEN" && <form onSubmit={cancel} className="space-y-3">
        <label className="block">Lý do hủy<textarea className={field} required minLength={5} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /></label>
        <button className={button} disabled={busy}>Hủy yêu cầu</button>
      </form>}
      <h3 className="font-bold">Lịch sử trạng thái</h3>
      <ul className="space-y-2">{booking.events?.map(e => <li key={e.id}>{new Date(e.createdAt).toLocaleString("vi-VN")} · {statusLabels[e.toStatus] || e.toStatus}{e.reason && ` — ${e.reason}`}</li>)}</ul>
    </>}
  </Panel>;
}
