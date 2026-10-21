import { api } from "@/lib/api";
import { getAccessToken } from "@/services/auth.service";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export type RouteOption = {
  routeId: string;
  origin: string;
  destination: string;
  distance: number;
};

export type TripOption = {
  tripId: string;
  routeName: string;
  departureTime: string;
  vehicleType: string;
  price: number | null;
  totalSeats: number;
  availableSeats: number;
};

export type StopOption = {
  stopId: string;
  stopName: string;
  address: string;
  type: "PICKUP" | "DROPOFF" | "BOTH";
  stopOrder: number;
};

export type FareOption = {
  bookingTypeId: string;
  typeName: string;
  farePerSeat: number | null;
};

export type TripDetail = {
  tripId: string;
  routeId: string;
  routeName: string;
  departureTime: string;
  price: number | null;
  status: string;
  vehicleName: string;
  totalSeats: number;
  stops: StopOption[];
  fareOptions: FareOption[];
};

export type SeatAvailability = {
  tripId: string;
  totalSeats: number;
  bookedSeats: string[];
  availableSeats: number;
};

export type BookingType = {
  bookingTypeId: string;
  typeName: string;
  description: string | null;
};

export type BookingDraft = {
  routeId: string;
  tripId: string;
  routeName: string;
  departureTime: string;
  vehicleName: string;
  seatNumbers: string[];
  pickupPointId: string;
  pickupPoint: string;
  dropoffPointId: string;
  dropoffPoint: string;
  bookingTypeId: string;
  bookingTypeName: string;
  farePerSeat: number;
  customerName?: string;
  contactPhone?: string;
  driverNote?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
};

export type BookingDetail = {
  bookingId: string;
  tripId: string;
  seatNumbers: string[];
  seatCount: number;
  farePerSeat: number;
  totalFare: number;
  bookingStatus: string;
  paymentStatus: string;
  expiresAt: string;
  departureTime: string;
  routeName: string;
  vehicleName: string;
  pickupPoint: string;
  dropoffPoint: string;
  transactionId: string | null;
  paymentMethod: string | null;
  customerName?: string | null;
  contactPhone?: string | null;
  driverNote?: string | null;
  pickupAddress?: string | null;
  dropoffAddress?: string | null;
};

const BASE = "/customer/v1";
const authToken = () => {
  const token = getAccessToken();
  if (!token) throw new Error("Vui lòng đăng nhập để tiếp tục đặt chuyến.");
  return token;
};

export const bookingApi = {
  async routes(from = "", to = "") {
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    const suffix = query.size ? `?${query.toString()}` : "";
    return (await api.get<ApiResponse<RouteOption[]>>(`${BASE}/routes/search${suffix}`)).data;
  },
  async bookingTypes() {
    return (await api.get<ApiResponse<BookingType[]>>(`${BASE}/booking-types`)).data;
  },
  async trips(routeId: string, date: string, seats = 1) {
    const query = new URLSearchParams({ routeId, date, seats: String(seats) });
    return (await api.get<ApiResponse<TripOption[]>>(`${BASE}/trips/search?${query}`)).data;
  },
  async trip(tripId: string) {
    return (await api.get<ApiResponse<TripDetail>>(`${BASE}/trips/${encodeURIComponent(tripId)}`)).data;
  },
  async seats(tripId: string) {
    return (await api.get<ApiResponse<SeatAvailability>>(`${BASE}/trips/${encodeURIComponent(tripId)}/seats`)).data;
  },
  async createBooking(customerId: string, draft: BookingDraft) {
    return (await api.post<ApiResponse<{ bookingId: string; totalFare: number; paymentStatus: string }>>(
      `${BASE}/bookings`,
      {
        customerId,
        tripId: draft.tripId,
        seatNumbers: draft.seatNumbers,
        pickupPointId: draft.pickupPointId,
        dropoffPointId: draft.dropoffPointId,
        bookingTypeId: draft.bookingTypeId,
        customerName: draft.customerName,
        contactPhone: draft.contactPhone,
        driverNote: draft.driverNote,
        pickupAddress: draft.pickupAddress,
        dropoffAddress: draft.dropoffAddress,
      },
      authToken(),
    )).data;
  },
  async booking(bookingId: string) {
    return (await api.get<ApiResponse<BookingDetail>>(
      `${BASE}/bookings/${encodeURIComponent(bookingId)}`,
      authToken(),
    )).data;
  },
  async pay(bookingId: string, paymentMethod: string, amount: number) {
    return (await api.post<ApiResponse<{ transactionId: string; status: string }>>(
      `${BASE}/payments/process`,
      { bookingId, paymentMethod, amount },
      authToken(),
    )).data;
  },
};

export const bookingErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Không thể kết nối tới hệ thống. Vui lòng thử lại.";
};

export const bookingErrorStatus = (error: unknown) =>
  typeof error === "object" && error !== null && "status" in error
    ? (error as { status?: number }).status : undefined;

export const formatFare = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export const formatDeparture = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
