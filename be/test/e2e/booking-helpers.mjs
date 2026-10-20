import assert from "node:assert/strict";
import crypto from "node:crypto";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// Intentionally restricted to the dedicated local Docker database.
export const sql = mysql.createPool({
  host: "127.0.0.1", port: 3308, user: "goride", password: "goride_local", database: "goride",
  timezone: "Z", supportBigNumbers: true, bigNumberStrings: true,
});
export const key = () => crypto.randomUUID();
export const apiBase = "http://127.0.0.1:3100/api/v1";
export async function request(path, token, body, method = "POST", operationKey = key()) {
  const response = await fetch(apiBase + path, {
    method, headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), "idempotency-key": operationKey },
    ...(method !== "GET" ? { body: JSON.stringify(body ?? {}) } : {}),
  });
  return { status: response.status, body: await response.json() };
}
export async function actor(role = "CUSTOMER", balance = "200000.00") {
  const id = key(), phone = `+849${crypto.randomInt(10000000, 99999999)}`;
  await sql.execute("INSERT INTO users (id, full_name, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')",
    [id, `Test ${role}`, phone, await bcrypt.hash("BookingTest123!", 4), role]);
  let driverId;
  if (role === "DRIVER") {
    const [v] = await sql.execute("INSERT INTO vehicles (license_plate, seat_count) VALUES (?, 7)", [`T-${id.slice(0, 12)}`]);
    const [d] = await sql.execute("INSERT INTO driver_profiles (user_id, assigned_vehicle_id, approval_status) VALUES (?, ?, 'APPROVED')", [id, v.insertId]);
    driverId = String(d.insertId);
    await sql.execute("INSERT INTO driver_wallets (driver_id, balance) VALUES (?, ?)", [driverId, balance]);
  }
  const login = await request("/auth/login", null, { identifier: phone, password: "BookingTest123!", clientRole: role });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  const token = login.body.data.tokens.accessToken;
  if (driverId) assert.equal((await request("/driver/location", token, { lat: 21.03, lng: 105.85 }, "PUT")).status, 200);
  return { id, token, driverId };
}
export async function newBooking(customer, overrides = {}) {
  const input = {
    pickup: { lat: 21.03, lng: 105.85, address: "Điểm đón Hà Nội" },
    destination: { lat: 21.1, lng: 106.1, address: "Điểm trả Bắc Ninh" },
    departureAt: new Date(Date.now() + 8 * 3600_000).toISOString(), seatCount: 2, ...overrides,
  };
  const quoted = await request("/customer/quotes", customer.token, input);
  assert.equal(quoted.status, 200, JSON.stringify(quoted.body));
  const body = { quoteId: quoted.body.data.quoteId, contactName: "Khách kiểm thử", contactPhone: "0912345678" };
  const operationKey = key();
  const created = await request("/customer/bookings", customer.token, body, "POST", operationKey);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  return { id: created.body.data.bookingId, createBody: body, createKey: operationKey, created };
}
export async function acceptBooking(driver, booking) {
  const accepted = await request(`/driver/bookings/${booking.id}/accept`, driver.token);
  assert.equal(accepted.status, 200, JSON.stringify(accepted.body));
  return accepted;
}
