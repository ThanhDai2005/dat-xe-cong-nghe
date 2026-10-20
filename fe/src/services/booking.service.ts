import { api } from "@/lib/api";
import { getAccessToken } from "./auth.service";

export type Place = { address: string; lat: number; lng: number };
export type QuoteInput = { pickup: Place; destination: Place; departureAt: string; seatCount: number };
export type Quote = { quoteId: string; provider: string; distanceMeters: number; farePerSeat: string; totalFare: string; cashTotal: number; expiresAt: string };
export type Contact = { contactName: string; contactPhone: string; note: string };
export type Booking = QuoteInput & {
  id: string; status: string; totalFare: string; cashTotal: number; provider: string;
  contactName?: string; contactPhone?: string; note?: string;
  driver?: { name: string; phone: string; licensePlate: string } | null;
  events?: { id: string; toStatus: string; reason: string | null; createdAt: string }[];
};
type Result<T> = { success: boolean; data: T };
export const bookingApi = {
  quote: (input: QuoteInput) => api.post<Result<Quote>>("/v1/customer/quotes", input, getAccessToken()),
  create: (quoteId: string, contact: Contact, key: string) => api.post<Result<{ bookingId: string }>>("/v1/customer/bookings", { quoteId, ...contact }, getAccessToken(), key),
  list: (status = "", before = "") => api.get<Result<{ items: Booking[]; nextCursor: string | null }>>(
    `/v1/customer/bookings?limit=20${status ? `&status=${encodeURIComponent(status)}` : ""}${before ? `&before=${encodeURIComponent(before)}` : ""}`, getAccessToken()),
  detail: (id: string) => api.get<Result<Booking>>(`/v1/customer/bookings/${encodeURIComponent(id)}`, getAccessToken()),
  cancel: (id: string, reason: string, key: string) => api.post<Result<unknown>>(`/v1/customer/bookings/${encodeURIComponent(id)}/cancel`, { reason }, getAccessToken(), key),
};
export function apiMessage(error: unknown) {
  const e = error as { status?: number; message?: string };
  return e?.status === 401 ? "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." : e?.message || "Không kết nối được API. Vui lòng thử lại.";
}
export const statusLabels: Record<string, string> = {
  OPEN: "Đang tìm tài xế", ACCEPTED: "Tài xế đã nhận", CUSTOMER_CONFIRMED: "Đã xác nhận đi",
  CUSTOMER_NOT_CONFIRMED: "Khách không đi", IN_PROGRESS: "Đang di chuyển", COMPLETED: "Hoàn thành",
  NOT_COMPLETED: "Không hoàn thành", CLOSE: "Đã hủy", EXPIRED: "Hết hạn",
};
