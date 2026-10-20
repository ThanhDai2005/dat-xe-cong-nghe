import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { db } from "../database";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import { ensure } from "../core/errors";
import { idSchema, cents, money } from "./domain";

const pageSchema = z.object({
  before: idSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
const filtersSchema = pageSchema.extend({
  status: z.enum(["OPEN", "ACCEPTED", "CUSTOMER_CONFIRMED", "CUSTOMER_NOT_CONFIRMED", "IN_PROGRESS",
    "COMPLETED", "NOT_COMPLETED", "CLOSE", "EXPIRED"]).optional(),
});
const selection = `b.id, b.pickup_address, b.destination_address, b.requested_departure_at,
  b.seat_count, b.fare_per_seat, b.status, b.created_at,
  ST_Latitude(b.pickup_position) AS pickup_lat, ST_Longitude(b.pickup_position) AS pickup_lng,
  ST_Latitude(b.destination_position) AS destination_lat, ST_Longitude(b.destination_position) AS destination_lng,
  d.distance_meters, q.provider`;
const joins = "FROM booking_requests b JOIN booking_details d ON d.booking_id = b.id JOIN booking_quotes q ON q.id = d.quote_id";
function summary(row: RowDataPacket) {
  const total = cents(row.fare_per_seat) * BigInt(row.seat_count);
  return {
    id: String(row.id), status: row.status, departureAt: row.requested_departure_at,
    createdAt: row.created_at, seatCount: row.seat_count, farePerSeat: row.fare_per_seat,
    totalFare: money(total), cashTotal: Number((total + 50000n) / 100000n * 1000n),
    distanceMeters: row.distance_meters, provider: row.provider,
    pickup: { lat: row.pickup_lat, lng: row.pickup_lng, address: row.pickup_address },
    destination: { lat: row.destination_lat, lng: row.destination_lng, address: row.destination_address },
    ...(row.pickup_distance !== undefined ? { pickupDistanceMeters: row.pickup_distance } : {}),
  };
}
function paginate(rows: RowDataPacket[], limit: number) {
  return { items: rows.slice(0, limit).map(summary),
    nextCursor: rows.length > limit ? String(rows[limit - 1].id) : null };
}
async function driver(userId: string) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT id, assigned_vehicle_id FROM driver_profiles WHERE user_id = ? AND approval_status = 'APPROVED'", [userId]);
  ensure(rows[0], 403, "DRIVER_NOT_APPROVED", "Tài xế chưa được duyệt");
  return rows[0];
}
export const lookupRouter = Router();
lookupRouter.use(requireAuth);

lookupRouter.get("/driver/bookings/nearby", requireRole("DRIVER"), async (req, res) => {
  const input = pageSchema.parse(req.query), d = await driver(req.user!.sub);
  const [gps] = await db.execute<RowDataPacket[]>(
    "SELECT driver_id FROM driver_current_locations WHERE driver_id = ? AND updated_at >= UTC_TIMESTAMP(3) - INTERVAL 1 MINUTE", [d.id]);
  ensure(gps.length, 409, "LOCATION_NOT_ELIGIBLE", "Cần cập nhật GPS trong 1 phút");
  const [rows] = await db.query<RowDataPacket[]>(`SELECT ${selection},
    ST_Distance_Sphere(l.current_position, b.pickup_position) AS pickup_distance
    ${joins} JOIN driver_current_locations l ON l.driver_id = ?
    JOIN vehicles v ON v.id = ?
    WHERE b.status = 'OPEN' AND b.requested_departure_at > UTC_TIMESTAMP(3)
      AND l.updated_at >= UTC_TIMESTAMP(3) - INTERVAL 1 MINUTE
      AND v.vehicle_status = 'ACTIVE' AND b.seat_count <= v.seat_count - 1
      AND ST_Distance_Sphere(l.current_position, b.pickup_position) <= 5000
      ${input.before ? "AND b.id < ?" : ""}
    ORDER BY b.id DESC LIMIT ?`, [d.id, d.assigned_vehicle_id, ...(input.before ? [input.before] : []), input.limit + 1]);
  // Contact details and customer identifiers are intentionally absent.
  res.json({ success: true, data: paginate(rows, input.limit) });
});

for (const [prefix, role] of [["customer", "CUSTOMER"], ["driver", "DRIVER"], ["admin", "ADMIN"]] as const) {
  lookupRouter.get(`/${prefix}/bookings`, requireRole(role), async (req, res) => {
    const input = filtersSchema.parse(req.query), conditions = ["1=1"], params: unknown[] = [];
    if (role === "CUSTOMER") { conditions.push("b.customer_user_id = ?"); params.push(req.user!.sub); }
    if (role === "DRIVER") { conditions.push("b.accepted_driver_id = ?"); params.push((await driver(req.user!.sub)).id); }
    if (input.status) { conditions.push("b.status = ?"); params.push(input.status); }
    if (input.before) { conditions.push("b.id < ?"); params.push(input.before); }
    const [rows] = await db.query<RowDataPacket[]>(`SELECT ${selection} ${joins}
      WHERE ${conditions.join(" AND ")} ORDER BY b.id DESC LIMIT ?`, [...params, input.limit + 1]);
    res.json({ success: true, data: paginate(rows, input.limit) });
  });
  lookupRouter.get(`/${prefix}/bookings/:id`, requireRole(role), async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const owner = role === "CUSTOMER" ? req.user!.sub : role === "DRIVER" ? (await driver(req.user!.sub)).id : null;
    const condition = role === "CUSTOMER" ? "AND b.customer_user_id = ?" : role === "DRIVER" ? "AND b.accepted_driver_id = ?" : "";
    const [rows] = await db.execute<RowDataPacket[]>(`SELECT ${selection}, d.contact_name, d.contact_phone, d.note,
      b.accepted_at, b.customer_confirmed_at, b.driver_departed_at, b.completed_at,
      u.full_name AS driver_name, u.phone AS driver_phone, v.license_plate
      ${joins} LEFT JOIN driver_profiles dp ON dp.id = b.accepted_driver_id
      LEFT JOIN users u ON u.id = dp.user_id LEFT JOIN vehicles v ON v.id = d.vehicle_id
      WHERE b.id = ? ${condition}`, [id, ...(owner === null ? [] : [owner])]);
    const row = rows[0];
    ensure(row, 404, "BOOKING_NOT_FOUND", "Không tìm thấy đơn");
    const [events] = await db.execute<RowDataPacket[]>(
      "SELECT id, from_status AS fromStatus, to_status AS toStatus, reason, created_at AS createdAt FROM booking_events WHERE booking_id = ? ORDER BY id", [id]);
    const [refunds] = await db.execute<RowDataPacket[]>(
      "SELECT reason, created_at AS createdAt FROM fee_refunds WHERE booking_id = ?", [id]);
    res.json({ success: true, data: { ...summary(row), contactName: row.contact_name, contactPhone: row.contact_phone, note: row.note,
      driver: row.driver_name ? { name: row.driver_name, phone: row.driver_phone, licensePlate: row.license_plate } : null,
      acceptedAt: row.accepted_at, confirmedAt: row.customer_confirmed_at, startedAt: row.driver_departed_at,
      completedAt: row.completed_at, events,
      ...(role !== "CUSTOMER" ? { feeRefunds: refunds } : {}),
    } });
  });
}
for (const [path, role] of [["/driver/wallet/transactions", "DRIVER"], ["/admin/drivers/:id/wallet/transactions", "ADMIN"]] as const) {
  lookupRouter.get(path, requireRole(role), async (req, res) => {
    const input = pageSchema.parse(req.query);
    const driverId = role === "DRIVER" ? (await driver(req.user!.sub)).id : idSchema.parse(req.params.id);
    const [rows] = await db.query<RowDataPacket[]>(`SELECT t.id, t.transaction_type AS type, t.amount_delta AS amount,
      t.balance_after AS balanceAfter, t.created_at AS createdAt,
      COALESCE(t.booking_request_id, d.related_booking_id) AS bookingId, d.reason, d.external_reference AS reference
      FROM wallet_transactions t JOIN driver_wallets w ON w.id = t.wallet_id
      LEFT JOIN wallet_transaction_details d ON d.transaction_id = t.id
      WHERE w.driver_id = ? ${input.before ? "AND t.id < ?" : ""} ORDER BY t.id DESC LIMIT ?`,
      [driverId, ...(input.before ? [input.before] : []), input.limit + 1]);
    res.json({ success: true, data: { items: rows.slice(0, input.limit),
      nextCursor: rows.length > input.limit ? String(rows[input.limit - 1].id) : null } });
  });
}
lookupRouter.get("/customer/profile", requireRole("CUSTOMER"), async (req, res) => {
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT id, full_name AS fullName, phone, email, avatar_url AS avatarUrl, role, status FROM users WHERE id = ?", [req.user!.sub]);
  res.json({ success: true, data: rows[0] });
});
lookupRouter.patch("/customer/profile", requireRole("CUSTOMER"), async (req, res) => {
  const input = z.object({ fullName: z.string().trim().min(2).max(100) }).strict().parse(req.body);
  // Phone/email/role/status changes need separate verified workflows.
  await db.execute("UPDATE users SET full_name = ? WHERE id = ?", [input.fullName, req.user!.sub]);
  res.json({ success: true, data: input });
});
lookupRouter.get("/admin/customers", requireRole("ADMIN"), async (req, res) => {
  const input = z.object({ limit: z.coerce.number().int().min(1).max(100).default(20),
    page: z.coerce.number().int().min(1).max(10000).default(1), search: z.string().trim().min(2).max(100).optional() }).strict().parse(req.query);
  const search = input.search ? "AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ?)" : "";
  const [rows] = await db.query<RowDataPacket[]>(`SELECT id, full_name AS fullName, phone, email, status, created_at AS createdAt
    FROM users WHERE role = 'CUSTOMER' ${search} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    [...(input.search ? Array(3).fill(`%${input.search}%`) : []), input.limit + 1, (input.page - 1) * input.limit]);
  res.json({ success: true, data: { items: rows.slice(0, input.limit), page: input.page, hasMore: rows.length > input.limit } });
});
