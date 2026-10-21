import { api } from "@/lib/api";
import { getAccessToken } from "./auth.service";

const base = "/v1/customer";

export interface RouteSearchResult {
  routeId: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration: number;
}

export interface TripSearchResult {
  tripId: string;
  routeName: string;
  origin: string;
  destination: string;
  departureTime: string;
  vehicleTypeName: string;
  licensePlate: string;
  price: number;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  estimatedDuration: number;
}

export interface StopPoint {
  stopId: string;
  stopName: string;
  address: string;
  stopOrder: number;
}

export interface TripDetailResult {
  tripId: string;
  route: {
    routeId: string;
    origin: string;
    destination: string;
    distance: number;
    estimatedDuration: number;
  };
  vehicle: {
    licensePlate: string;
    totalSeats: number;
    vehicleTypeName: string;
  };
  price: number;
  schedule: {
    departureTime: string;
    status: string;
  };
  pickupPoints: StopPoint[];
  dropoffPoints: StopPoint[];
}

export interface SeatInfo {
  seatNumber: string;
  isBooked: boolean;
}

export interface TripSeatsResult {
  tripId: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  seatMap: SeatInfo[];
}

export interface CreateBookingPayload {
  customerId?: string;
  tripId: string;
  seatNumbers: string[];
  pickupPointId?: string;
  dropoffPointId?: string;
  bookingTypeId?: string;
  customerName: string;
  contactPhone: string;
  driverNote?: string;
}

export interface CreateBookingResponse {
  bookingId: string;
  totalFare: number;
  seatCount: number;
  farePerSeat: number;
  seatNumbers: string[];
  paymentStatus: string;
  expiresAt: string;
}

export interface ProcessPaymentPayload {
  bookingId: string;
  paymentMethod: string;
  amount: number;
}

export interface ProcessPaymentResponse {
  transactionId: string;
  bookingId: string;
  amount: number;
  status: string;
}

export interface CustomerBookingItem {
  bookingId: string;
  tripInfo: string;
  origin: string;
  destination: string;
  departureTime: string;
  seats: string[];
  totalFare: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  bookingDate: string;
}

export const customerApi = {
  // 1. Tìm kiếm tuyến đường
  searchRoutes: (from = "", to = "") => {
    const q = new URLSearchParams();
    if (from) q.append("from", from);
    if (to) q.append("to", to);
    return api.get<{ success: boolean; data: RouteSearchResult[] }>(
      `${base}/routes/search${q.size ? `?${q}` : ""}`
    );
  },

  // 2. Tìm kiếm chuyến xe
  searchTrips: (routeId?: string, date?: string, seats = 1) => {
    const q = new URLSearchParams();
    if (routeId) q.append("routeId", routeId);
    if (date) q.append("date", date);
    if (seats) q.append("seats", String(seats));
    return api.get<{ success: boolean; data: TripSearchResult[] }>(
      `${base}/trips/search${q.size ? `?${q}` : ""}`
    );
  },

  // 3. Chi tiết chuyến xe
  getTripDetail: (tripId: string) =>
    api.get<{ success: boolean; data: TripDetailResult }>(`${base}/trips/${encodeURIComponent(tripId)}`),

  // 4. Sơ đồ ghế
  getTripSeats: (tripId: string) =>
    api.get<{ success: boolean; data: TripSeatsResult }>(`${base}/trips/${encodeURIComponent(tripId)}/seats`),

  // 5. Tạo đơn đặt vé
  createBooking: (payload: CreateBookingPayload) =>
    api.post<{ success: boolean; message: string; data: CreateBookingResponse }>(
      `${base}/bookings`,
      payload,
      getAccessToken()
    ),

  // 6. Xử lý thanh toán
  processPayment: (payload: ProcessPaymentPayload) =>
    api.post<{ success: boolean; message: string; data: ProcessPaymentResponse }>(
      `${base}/payments/process`,
      payload,
      getAccessToken()
    ),

  // 7. Lịch sử chuyến đi của khách hàng
  getMyBookings: (status?: string) => {
    const q = new URLSearchParams();
    if (status) q.append("status", status);
    return api.get<{ success: boolean; data: CustomerBookingItem[] }>(
      `${base}/my-bookings${q.size ? `?${q}` : ""}`,
      getAccessToken()
    );
  },

  // 8. Hủy vé
  cancelBooking: (bookingId: string, reason = "Khách hàng yêu cầu hủy") =>
    api.post<{ success: boolean; message: string; data: { requestId: string; status: string } }>(
      `${base}/bookings/${encodeURIComponent(bookingId)}/cancel`,
      { reason },
      getAccessToken()
    ),
};
