import { api } from "@/lib/api";
import { getAccessToken } from "@/services/auth.service";

export type ApiResponse<T> = { success: boolean; message?: string; data: T };
const base = "/v1/admin";
const token = () => {
  const value = getAccessToken();
  if (!value) throw new Error("Vui lòng đăng nhập tài khoản Admin.");
  return value;
};

// ── TYPES ──────────────────────────────────────────────────────────────────
export type AdminProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
};

export type AdminRoute = {
  routeId: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration: number;
  status: string;
};

export type CreateRoutePayload = {
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration: number;
};

export type UpdateRoutePayload = {
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration?: number;
};

export type AdminStop = {
  stopId: string;
  routeId: string;
  stopName: string;
  address: string;
  type: "PICKUP" | "DROPOFF" | "BOTH";
  stopOrder: number;
  status: string;
  origin?: string;
  destination?: string;
};

export type CreateStopPayload = {
  routeId: string;
  stopName: string;
  address: string;
  type: "PICKUP" | "DROPOFF" | "BOTH";
};

export type AdminVehicle = {
  vehicleId: string;
  licensePlate: string;
  seatCount: number;
  status: string;
  vehicleTypeId: string | null;
  vehicleTypeName: string | null;
};

export type CreateVehiclePayload = {
  licensePlate: string;
  vehicleType?: string;
  totalSeats: number;
};

export type AdminBookingType = {
  bookingTypeId: string;
  typeName: string;
  description: string | null;
  isActive: boolean;
};

export type CreateBookingTypePayload = {
  typeName: string;
  description?: string;
};

export type AdminVehicleType = {
  vehicleTypeId: string;
  typeName: string;
  isActive: boolean;
};

export type AdminFare = {
  fareId: string;
  routeId: string;
  bookingTypeId: string;
  vehicleTypeId: string | null;
  basePrice: number;
  isActive: boolean;
  origin: string;
  destination: string;
  bookingTypeName: string;
  vehicleTypeName: string | null;
};

export type FarePayload = {
  routeId: string;
  bookingTypeId: string;
  vehicleTypeId: string | null;
  basePrice: number;
};

export type AdminTrip = {
  tripId: string;
  routeId: string;
  vehicleId: string;
  departureTime: string;
  price: number | null;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  origin: string;
  destination: string;
  estimatedDuration: number;
  licensePlate: string;
  totalSeats: number;
  bookedSeats: number;
};

export type TripPayload = {
  routeId: string;
  vehicleId: string;
  departureTime: string;
  price: number;
};

export type AdminBookingListItem = {
  bookingId: string;
  customerName: string;
  tripInfo: string;
  seats: string[];
  totalFare: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  contactPhone: string | null;
  createdAt: string;
  tripId: string;
};

export type AdminBookingDetail = {
  bookingId: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    contactPhone: string;
    driverNote: string | null;
    pickupAddress: string | null;
    dropoffAddress: string | null;
    bookingTypeName: string | null;
    createdAt: string;
  };
  tripDetails: {
    tripId: string;
    origin: string;
    destination: string;
    departureTime: string;
    distance: number;
    estimatedDuration: number;
    licensePlate: string;
    vehicleTypeName: string | null;
    seats: string[];
    seatCount: number;
    farePerSeat: number;
  };
  paymentDetails: {
    totalFare: number;
    bookingStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    paidAt: string | null;
    transactions: {
      transactionId: string;
      amount: number;
      paymentMethod: string;
      status: string;
      paidAt: string;
    }[];
  };
};

export type AdminPayment = {
  transactionId: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  customerName: string;
  contactPhone: string;
  route: string;
};

export type AdminCancellation = {
  cancellationId: string;
  bookingId: string;
  requestedBy: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminId: string | null;
  reasonNote: string | null;
  applyCommissionPenalty: boolean;
  penaltyAmount: number;
  createdAt: string;
  customerName: string;
  contactPhone: string;
  totalFare: number;
  paymentStatus: string;
  origin: string;
  destination: string;
  departureTime: string;
};

export type AdminRefund = {
  refundId: string;
  bookingId: string;
  cancellationId: string | null;
  refundPercentage: number;
  finalRefundAmount: number;
  status: "PENDING" | "REFUNDED" | "FAILED";
  createdAt: string;
  customerName: string;
  contactPhone: string;
  totalFare: number;
  origin: string;
  destination: string;
};

export type RecentBooking = {
  bookingId: string;
  customerName: string | null;
  contactPhone: string | null;
  totalFare: number;
  bookingStatus: string;
  seatCount: number;
  createdAt: string;
  origin: string;
  destination: string;
};

export type DashboardStats = {
  totalRevenue: number;
  activeTrips: number;
  bookedSeats: number;
  activeVehicles: number;
  totalRoutes: number;
  totalFares: number;
  totalTrips: number;
  totalBookings: number;
  monthlyRevenue: { name: string; total: number }[];
  recentBookings: RecentBooking[];
};

const data = async <T>(promise: Promise<ApiResponse<T>>) => (await promise).data;
const resp = async <T>(promise: Promise<ApiResponse<T>>) => await promise;

// ── API CLIENT ─────────────────────────────────────────────────────────────
export const adminApi = {
  // Auth & Profile
  me: () => data(api.get<ApiResponse<AdminProfile>>(`${base}/me`, token())),
  dashboardStats: () => data(api.get<ApiResponse<DashboardStats>>(`${base}/dashboard-stats`, token())),

  // Routes
  routes: () => data(api.get<ApiResponse<AdminRoute[]>>(`${base}/routes`, token())),
  createRoute: (payload: CreateRoutePayload) => data(api.post<ApiResponse<AdminRoute>>(`${base}/routes`, payload, token())),
  updateRoute: (routeId: string, payload: UpdateRoutePayload) => resp(api.put<ApiResponse<null>>(`${base}/routes/${encodeURIComponent(routeId)}`, payload, token())),
  deleteRoute: (routeId: string) => resp(api.del<ApiResponse<null>>(`${base}/routes/${encodeURIComponent(routeId)}`, undefined, token())),

  // Stops
  stops: (routeId?: string) => {
    const q = routeId ? `?routeId=${encodeURIComponent(routeId)}` : "";
    return data(api.get<ApiResponse<AdminStop[]>>(`${base}/stops${q}`, token()));
  },
  createStop: (payload: CreateStopPayload) => data(api.post<ApiResponse<AdminStop>>(`${base}/stops`, payload, token())),
  deleteStop: (stopId: string) => resp(api.del<ApiResponse<null>>(`${base}/stops/${encodeURIComponent(stopId)}`, undefined, token())),

  // Vehicles
  vehicles: () => data(api.get<ApiResponse<AdminVehicle[]>>(`${base}/vehicles`, token())),
  createVehicle: (payload: CreateVehiclePayload) => data(api.post<ApiResponse<AdminVehicle>>(`${base}/vehicles`, payload, token())),
  assignVehicleType: (vehicleId: string, vehicleTypeId: string | null) =>
    data(api.patch<ApiResponse<{ vehicleId: string; vehicleTypeId: string | null }>>(`${base}/vehicles/${encodeURIComponent(vehicleId)}/type`, { vehicleTypeId }, token())),

  // Vehicle Types
  vehicleTypes: () => data(api.get<ApiResponse<AdminVehicleType[]>>(`${base}/vehicle-types`, token())),
  createVehicleType: (typeName: string) => data(api.post<ApiResponse<AdminVehicleType>>(`${base}/vehicle-types`, { typeName }, token())),

  // Booking Types
  bookingTypes: () => data(api.get<ApiResponse<AdminBookingType[]>>(`${base}/booking-types`, token())),
  createBookingType: (payload: CreateBookingTypePayload) => data(api.post<ApiResponse<AdminBookingType>>(`${base}/booking-types`, payload, token())),

  // Fares
  fares: (query?: { routeId?: string; active?: string }) => {
    const q = new URLSearchParams(Object.entries(query || {}).filter(([, v]) => Boolean(v)) as [string, string][]);
    return data(api.get<ApiResponse<AdminFare[]>>(`${base}/fares${q.size ? `?${q}` : ""}`, token()));
  },
  createFare: (payload: FarePayload) => data(api.post<ApiResponse<{ fareId: string; basePrice: number }>>(`${base}/fares`, payload, token())),
  updateFare: (fareId: string, basePrice: number) => resp(api.put<ApiResponse<null>>(`${base}/fares/${encodeURIComponent(fareId)}`, { basePrice }, token())),
  deleteFare: (fareId: string) => resp(api.del<ApiResponse<null>>(`${base}/fares/${encodeURIComponent(fareId)}`, undefined, token())),

  // Trips
  trips: (filters: { routeId?: string; date?: string; status?: string } = {}) => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][]);
    return data(api.get<ApiResponse<AdminTrip[]>>(`${base}/trips${query.size ? `?${query}` : ""}`, token()));
  },
  createTrip: (payload: TripPayload) => data(api.post<ApiResponse<{ tripId: string; status: string }>>(`${base}/trips`, payload, token())),
  updateTrip: (tripId: string, payload: TripPayload) => data(api.put<ApiResponse<{ tripId: string; status: string }>>(`${base}/trips/${encodeURIComponent(tripId)}`, payload, token())),
  updateTripStatus: (tripId: string, status: AdminTrip["status"]) =>
    resp(api.patch<ApiResponse<null>>(`${base}/trips/${encodeURIComponent(tripId)}/status`, { status }, token())),

  // Bookings
  bookings: (filters: { status?: string; tripId?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== "") as [string, string][]
    );
    return data(api.get<ApiResponse<AdminBookingListItem[]>>(`${base}/bookings${query.size ? `?${query}` : ""}`, token()));
  },
  bookingDetail: (bookingId: string) => data(api.get<ApiResponse<AdminBookingDetail>>(`${base}/bookings/${encodeURIComponent(bookingId)}`, token())),

  // Payments
  payments: (filters: { fromDate?: string; toDate?: string; status?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => Boolean(v)) as [string, string][]
    );
    return data(api.get<ApiResponse<AdminPayment[]>>(`${base}/payments${query.size ? `?${query}` : ""}`, token()));
  },

  // Cancellations
  cancellations: (filters: { status?: string; bookingId?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => Boolean(v)) as [string, string][]
    );
    return data(api.get<ApiResponse<AdminCancellation[]>>(`${base}/cancellations${query.size ? `?${query}` : ""}`, token()));
  },
  requestCancellation: (payload: { bookingId: string; requestedBy?: string; reason: string }) =>
    resp(api.post<ApiResponse<{ requestId: string; status: string }>>(`${base}/cancellations/request`, payload, token())),
  approveCancellation: (cancellationId: string, payload: { adminId?: string; reasonNote: string; applyCommissionPenalty: boolean }) =>
    resp(api.post<ApiResponse<{ cancellationId: string; penaltyAmount: number; status: string }>>(`${base}/cancellations/${encodeURIComponent(cancellationId)}/approve`, payload, token())),

  // Refunds
  refunds: () => data(api.get<ApiResponse<AdminRefund[]>>(`${base}/refunds`, token())),
  processRefund: (payload: { bookingId: string; cancellationId?: string | null; refundPercentage: number }) =>
    resp(api.post<ApiResponse<{ refundId: string; finalRefundAmount: number; status: string }>>(`${base}/refunds/process`, payload, token())),
};

// ── UTILS ──────────────────────────────────────────────────────────────────
export const adminErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
  }
  return "Không thể kết nối tới máy chủ. Vui lòng thử lại.";
};

export const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

export const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};
