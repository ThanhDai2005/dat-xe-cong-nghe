import { ApiError, ensure } from "../core/errors";
import type { Position } from "./domain";

export async function googleDistance(origin: Position, destination: Position, key: string, fetcher: typeof fetch = fetch): Promise<number> {
  let response: Response;
  try {
    response = await fetcher("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "routes.distanceMeters" },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        travelMode: "DRIVE", routingPreference: "TRAFFIC_UNAWARE", computeAlternativeRoutes: false,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch { throw new ApiError(503, "MAPS_UNAVAILABLE", "Chưa thể tính quãng đường. Vui lòng thử lại"); }
  ensure(response.ok, 503, "MAPS_UNAVAILABLE", "Dịch vụ bản đồ chưa sẵn sàng");
  let data;
  try { data = await response.json() as { routes?: { distanceMeters?: number }[] }; }
  catch { throw new ApiError(503, "MAPS_INVALID_RESPONSE", "Phản hồi bản đồ không hợp lệ"); }
  const distance = data.routes?.[0]?.distanceMeters;
  ensure(typeof distance === "number" && Number.isInteger(distance) && distance > 0 && distance <= 3_000_000,
    422, "ROUTE_NOT_FOUND", "Không tìm được hành trình lái xe phù hợp");
  return distance;
}

export async function routeDistance(origin: Position, destination: Position) {
  const { config } = await import("../config.js");
  if (config.MAPS_PROVIDER === "mock") {
    ensure(config.NODE_ENV !== "production", 503, "MOCK_MAPS_DISABLED", "Không dùng bản đồ giả lập trong production");
    return { distanceMeters: config.MAPS_MOCK_DISTANCE_METERS, provider: "mock" };
  }
  ensure(config.GOOGLE_MAPS_API_KEY, 503, "MAPS_NOT_CONFIGURED", "Chưa cấu hình Google Maps");
  return { distanceMeters: await googleDistance(origin, destination, config.GOOGLE_MAPS_API_KEY), provider: "google" };
}
