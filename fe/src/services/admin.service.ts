import { api } from "@/lib/api";
import { getAccessToken } from "@/services/auth.service";

type Response<T> = { success: boolean; message?: string; data: T };
const base = "/v1/admin";
const token = () => {
  const value = getAccessToken();
  if (!value) throw new Error("Vui lòng đăng nhập tài khoản Admin.");
  return value;
};

export type AdminRoute = { routeId: string; origin: string; destination: string; distance: number; estimatedDuration: number; status: string };
export type AdminVehicle = { vehicleId: string; licensePlate: string; seatCount: number; status: string; vehicleTypeId: string | null; vehicleTypeName: string | null };
export type AdminBookingType = { bookingTypeId: string; typeName: string; description: string | null; isActive: boolean };
export type AdminVehicleType = { vehicleTypeId: string; typeName: string; isActive: boolean };
export type AdminFare = { fareId: string; routeId: string; bookingTypeId: string; vehicleTypeId: string | null; basePrice: number; isActive: boolean; origin: string; destination: string; bookingTypeName: string; vehicleTypeName: string | null };
export type AdminTrip = { tripId: string; routeId: string; vehicleId: string; departureTime: string; price: number | null; status: "OPEN" | "CLOSED" | "CANCELLED"; origin: string; destination: string; estimatedDuration: number; licensePlate: string; totalSeats: number; bookedSeats: number };
export type FarePayload = { routeId: string; bookingTypeId: string; vehicleTypeId: string | null; basePrice: number };
export type TripPayload = { routeId: string; vehicleId: string; departureTime: string; price: number };

const data = async <T>(promise: Promise<Response<T>>) => (await promise).data;
export const adminApi = {
  routes: () => data(api.get<Response<AdminRoute[]>>(`${base}/routes`, token())),
  vehicles: () => data(api.get<Response<AdminVehicle[]>>(`${base}/vehicles`, token())),
  assignVehicleType: (vehicleId: string, vehicleTypeId: string | null) => data(api.patch<Response<{ vehicleId: string; vehicleTypeId: string | null }>>(`${base}/vehicles/${encodeURIComponent(vehicleId)}/type`, { vehicleTypeId }, token())),
  bookingTypes: () => data(api.get<Response<AdminBookingType[]>>(`${base}/booking-types`, token())),
  vehicleTypes: () => data(api.get<Response<AdminVehicleType[]>>(`${base}/vehicle-types`, token())),
  createVehicleType: (typeName: string) => data(api.post<Response<AdminVehicleType>>(`${base}/vehicle-types`, { typeName }, token())),
  fares: () => data(api.get<Response<AdminFare[]>>(`${base}/fares`, token())),
  createFare: (payload: FarePayload) => data(api.post<Response<{ fareId: string; basePrice: number }>>(`${base}/fares`, payload, token())),
  updateFare: (fareId: string, basePrice: number) => data(api.put<Response<{ fareId: string; basePrice: number }>>(`${base}/fares/${encodeURIComponent(fareId)}`, { basePrice }, token())),
  deleteFare: (fareId: string) => data(api.del<Response<null>>(`${base}/fares/${encodeURIComponent(fareId)}`, undefined, token())),
  trips: (filters: { routeId?: string; date?: string; status?: string } = {}) => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][]);
    return data(api.get<Response<AdminTrip[]>>(`${base}/trips${query.size ? `?${query}` : ""}`, token()));
  },
  createTrip: (payload: TripPayload) => data(api.post<Response<{ tripId: string; status: string }>>(`${base}/trips`, payload, token())),
  updateTrip: (tripId: string, payload: TripPayload) => data(api.put<Response<{ tripId: string; status: string }>>(`${base}/trips/${encodeURIComponent(tripId)}`, payload, token())),
  updateTripStatus: (tripId: string, status: AdminTrip["status"]) => data(api.patch<Response<{ tripId: string; status: string }>>(`${base}/trips/${encodeURIComponent(tripId)}/status`, { status }, token())),
};

export const adminErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
  return "Không thể kết nối tới máy chủ. Vui lòng thử lại.";
};

export const currency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
