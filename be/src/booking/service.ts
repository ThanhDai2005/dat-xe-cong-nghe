import crypto from "node:crypto";
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { db } from "../database";
import { ensure } from "../core/errors";
import { once, transaction } from "../core/transaction";
import { cents, money, intermediaryFee, validateDeparture, wkt, type QuoteInput } from "./domain";
import { routeDistance } from "./maps";

export async function audit(c: PoolConnection, id: string, actor: string | null, from: string | null, to: string, reason: string | null = null) {
  await c.execute("INSERT INTO booking_events (booking_id, actor_user_id, from_status, to_status, reason) VALUES (?, ?, ?, ?, ?)",
    [id, actor, from, to, reason]);
}
export async function lockedBooking(c: PoolConnection, id: string) {
  const [rows] = await c.execute<RowDataPacket[]>("SELECT *, requested_departure_at <= UTC_TIMESTAMP(3) AS expired FROM booking_requests WHERE id = ? FOR UPDATE", [id]);
  ensure(rows[0], 404, "BOOKING_NOT_FOUND", "Không tìm thấy đơn");
  return rows[0];
}
export async function driverFor(c: PoolConnection, userId: string) {
  const [rows] = await c.execute<RowDataPacket[]>("SELECT * FROM driver_profiles WHERE user_id = ? FOR UPDATE", [userId]);
  ensure(rows[0]?.approval_status === "APPROVED", 403, "DRIVER_NOT_APPROVED", "Tài xế chưa được duyệt");
  return rows[0];
}
export async function quote(userId: string, input: QuoteInput) {
  validateDeparture(input.departureAt);
  ensure(input.pickup.lat !== input.destination.lat || input.pickup.lng !== input.destination.lng,
    400, "SAME_LOCATION", "Điểm đón và điểm đến phải khác nhau");
  const result = await routeDistance(input.pickup, input.destination);
  const id = crypto.randomUUID();
  const fare = result.distanceMeters * 5; // 5000 VND / km, distance is integer meters.
  const expiresAt = new Date(Date.now() + 10 * 60_000);
  await db.execute(
    "INSERT INTO booking_quotes (id, customer_user_id, payload, distance_meters, fare_per_seat, provider, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, userId, JSON.stringify(input), result.distanceMeters, fare, result.provider, expiresAt],
  );
  return { quoteId: id, ...result, farePerSeat: money(BigInt(fare) * 100n), totalFare: money(BigInt(fare * input.seatCount) * 100n),
    cashTotal: Math.round(fare * input.seatCount / 1000) * 1000, currency: "VND", expiresAt: expiresAt.toISOString() };
}
export async function createBooking(userId: string, key: string | undefined,
  input: { quoteId: string; contactName: string; contactPhone: string; note: string }) {
  return once(userId, "booking:create", key, input, async (c) => {
    const [quotes] = await c.execute<RowDataPacket[]>(
      "SELECT *, expires_at > UTC_TIMESTAMP(3) AS valid FROM booking_quotes WHERE id = ? AND customer_user_id = ? FOR UPDATE", [input.quoteId, userId],
    );
    const q = quotes[0];
    ensure(q, 404, "QUOTE_NOT_FOUND", "Không tìm thấy báo giá");
    const [existing] = await c.execute<RowDataPacket[]>("SELECT booking_id FROM booking_details WHERE quote_id = ?", [input.quoteId]);
    ensure(!existing.length, 409, "QUOTE_ALREADY_USED", "Báo giá đã được dùng để tạo đơn");
    ensure(Number(q.valid) === 1, 409, "QUOTE_EXPIRED", "Báo giá hết hạn. Vui lòng lấy báo giá mới");
    const payload: QuoteInput = typeof q.payload === "string" ? JSON.parse(q.payload) : q.payload;
    validateDeparture(payload.departureAt);
    const [insert] = await c.execute<ResultSetHeader>(
      `INSERT INTO booking_requests (customer_user_id, pickup_position, pickup_address, destination_position, destination_address,
        requested_departure_at, seat_count, fare_per_seat)
       VALUES (?, ST_GeomFromText(?, 4326, 'axis-order=long-lat'), ?, ST_GeomFromText(?, 4326, 'axis-order=long-lat'), ?, ?, ?, ?)`,
      [userId, wkt(payload.pickup), payload.pickup.address, wkt(payload.destination), payload.destination.address,
        new Date(payload.departureAt), payload.seatCount, q.fare_per_seat],
    );
    const bookingId = String(insert.insertId);
    await c.execute("INSERT INTO booking_details (booking_id, quote_id, contact_name, contact_phone, note, distance_meters) VALUES (?, ?, ?, ?, ?, ?)",
      [bookingId, input.quoteId, input.contactName, input.contactPhone, input.note, q.distance_meters]);
    await audit(c, bookingId, userId, null, "OPEN");
    return { bookingId, status: "OPEN", totalFare: money(cents(q.fare_per_seat) * BigInt(payload.seatCount)) };
  });
}
export async function accept(userId: string, id: string, key: string | undefined) {
  return once(userId, `booking:${id}:accept`, key, {}, async (c) => {
    const driver = await driverFor(c, userId);
    const booking = await lockedBooking(c, id);
    ensure(booking.status === "OPEN" && Number(booking.expired) === 0, 409, "BOOKING_UNAVAILABLE", "Đơn không còn mở");
    const [vehicles] = await c.execute<RowDataPacket[]>("SELECT * FROM vehicles WHERE id = ? FOR SHARE", [driver.assigned_vehicle_id]);
    const vehicle = vehicles[0];
    ensure(vehicle?.vehicle_status === "ACTIVE" && vehicle.seat_count - 1 >= booking.seat_count,
      409, "VEHICLE_UNAVAILABLE", "Xe chưa sẵn sàng hoặc không đủ sức chứa cho yêu cầu");
    const [location] = await c.execute<RowDataPacket[]>(
      `SELECT ST_Distance_Sphere(l.current_position, b.pickup_position) AS distance
       FROM driver_current_locations l JOIN booking_requests b ON b.id = ?
       WHERE l.driver_id = ? AND l.updated_at >= UTC_TIMESTAMP(3) - INTERVAL 1 MINUTE`, [id, driver.id],
    );
    ensure(location[0] && location[0].distance <= 5000, 409, "LOCATION_NOT_ELIGIBLE", "Cần GPS mới trong 1 phút và cách điểm đón không quá 5 km");
    const [policies] = await c.execute<RowDataPacket[]>(
      "SELECT * FROM commission_policies WHERE is_active = 1 AND effective_from <= UTC_TIMESTAMP(3) ORDER BY effective_from DESC, id DESC LIMIT 1 FOR SHARE",
    );
    const policy = policies[0];
    ensure(policy, 409, "NO_ACTIVE_POLICY", "Chưa có chính sách hoa hồng có hiệu lực");
    const rate = Math.max(Number(policy.base_driver_rate), Math.min(Number(driver.current_driver_rate), Number(policy.maximum_driver_rate))).toFixed(4);
    const fee = intermediaryFee(booking.fare_per_seat, booking.seat_count, rate);
    const [wallets] = await c.execute<RowDataPacket[]>("SELECT * FROM driver_wallets WHERE driver_id = ? FOR UPDATE", [driver.id]);
    const wallet = wallets[0];
    ensure(wallet && cents(wallet.balance) >= fee, 409, "INSUFFICIENT_BALANCE", "Ví không đủ số dư nhận cuốc");
    const balance = money(cents(wallet.balance) - fee);
    await c.execute("UPDATE driver_wallets SET balance = ? WHERE id = ?", [balance, wallet.id]);
    const [feeRow] = await c.execute<ResultSetHeader>(
      "INSERT INTO wallet_transactions (wallet_id, booking_request_id, transaction_type, amount_delta, balance_after) VALUES (?, ?, 'INTERMEDIARY_FEE', ?, ?)",
      [wallet.id, id, money(-fee), balance],
    );
    await c.execute("INSERT INTO wallet_transaction_details (transaction_id, performed_by, reason, related_booking_id) VALUES (?, ?, ?, ?)",
      [String(feeRow.insertId), userId, "Phí nhận cuốc", id]);
    await c.execute("UPDATE booking_requests SET accepted_driver_id = ?, status = 'ACCEPTED', commission_policy_id = ?, driver_rate_at_accept = ?, accepted_at = UTC_TIMESTAMP(3) WHERE id = ?",
      [driver.id, policy.id, rate, id]);
    await c.execute("UPDATE booking_details SET vehicle_id = ?, base_rate_at_accept = ?, increase_at_accept = ?, max_rate_at_accept = ? WHERE booking_id = ?",
      [vehicle.id, policy.base_driver_rate, policy.increase_per_completed_trip, policy.maximum_driver_rate, id]);
    await audit(c, id, userId, "OPEN", "ACCEPTED");
    return { bookingId: id, status: "ACCEPTED", fee: money(fee), balance };
  });
}
export async function transition(userId: string, id: string, key: string | undefined,
  target: "CUSTOMER_CONFIRMED" | "CUSTOMER_NOT_CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "NOT_COMPLETED", reason = "") {
  return once(userId, `booking:${id}:${target}`, key, { reason }, async (c) => {
    const driver = await driverFor(c, userId);
    const booking = await lockedBooking(c, id);
    ensure(String(booking.accepted_driver_id) === String(driver.id), 403, "FORBIDDEN", "Đơn không thuộc tài xế");
    if (booking.status === target) return { bookingId: id, status: target };
    const allowed: Record<string, string[]> = {
      CUSTOMER_CONFIRMED: ["ACCEPTED"],
      CUSTOMER_NOT_CONFIRMED: ["ACCEPTED", "CUSTOMER_CONFIRMED"],
      IN_PROGRESS: ["CUSTOMER_CONFIRMED"], COMPLETED: ["IN_PROGRESS"], NOT_COMPLETED: ["IN_PROGRESS"],
    };
    ensure(allowed[target].includes(booking.status), 409, "INVALID_TRANSITION", "Không thể chuyển trạng thái này");
    const columns: Record<string, string> = {
      CUSTOMER_CONFIRMED: ", customer_confirmed_at = UTC_TIMESTAMP(3)",
      IN_PROGRESS: ", driver_departed_at = UTC_TIMESTAMP(3)", COMPLETED: ", completed_at = UTC_TIMESTAMP(3)",
    };
    await c.execute(`UPDATE booking_requests SET status = ? ${columns[target] ?? ""} WHERE id = ?`, [target, id]);
    if (target === "COMPLETED" || target === "NOT_COMPLETED") {
      const [details] = await c.execute<RowDataPacket[]>("SELECT * FROM booking_details WHERE booking_id = ?", [id]);
      const d = details[0];
      if (target === "COMPLETED") {
        await c.execute("UPDATE driver_profiles SET current_driver_rate = LEAST(current_driver_rate + ?, ?), points_balance = points_balance + 10 WHERE id = ?",
          [d.increase_at_accept, d.max_rate_at_accept, driver.id]);
      } else {
        await c.execute("UPDATE driver_profiles SET current_driver_rate = ? WHERE id = ?", [d.base_rate_at_accept, driver.id]);
      }
    }
    if (target === "CUSTOMER_NOT_CONFIRMED" || target === "NOT_COMPLETED") {
      await c.execute("UPDATE booking_details SET closed_at = UTC_TIMESTAMP(3), closed_reason = ? WHERE booking_id = ?", [reason, id]);
    }
    await audit(c, id, userId, booking.status, target, reason || null);
    return { bookingId: id, status: target };
  });
}
export async function expireBookings() {
  return transaction(async (c) => {
    const [rows] = await c.query<RowDataPacket[]>(
      "SELECT id FROM booking_requests WHERE status = 'OPEN' AND requested_departure_at <= UTC_TIMESTAMP(3) LIMIT 100 FOR UPDATE SKIP LOCKED",
    );
    for (const row of rows) {
      await c.execute("UPDATE booking_requests SET status = 'EXPIRED' WHERE id = ?", [row.id]);
      await audit(c, String(row.id), null, "OPEN", "EXPIRED", "Quá giờ khởi hành");
    }
    return rows.length;
  });
}
