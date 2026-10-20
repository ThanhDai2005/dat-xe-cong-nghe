import test from "node:test";
import assert from "node:assert/strict";
import { sql, actor, request, newBooking, acceptBooking } from "./booking-helpers.mjs";
test.after(() => sql.end());
const get = (path, token) => request(path, token, undefined, "GET");
test("TASK-86: customers can only list/read their own bookings, with cursor and status", async () => {
  const owner = await actor(), other = await actor(), a = await newBooking(owner), b = await newBooking(owner);
  await newBooking(other);
  const page = await get("/customer/bookings?limit=1", owner.token);
  assert.equal(page.status, 200);
  assert.equal(page.body.data.items[0].id, b.id);
  const next = await get(`/customer/bookings?limit=1&before=${page.body.data.nextCursor}`, owner.token);
  assert.equal(next.body.data.items[0].id, a.id);
  assert.equal(next.body.data.nextCursor, null);
  assert.equal((await get(`/customer/bookings/${a.id}`, other.token)).status, 404);
  const detail = await get(`/customer/bookings/${a.id}`, owner.token);
  assert.equal(detail.body.data.contactPhone, "+84912345678");
  assert.equal(detail.body.data.totalFare, "100000.00");
  assert.equal(detail.body.data.cashTotal, 100000);
  assert.equal(detail.body.data.pickup.lat, 21.03);
  assert.equal(detail.body.data.pickup.lng, 105.85);
  assert.equal(detail.body.data.events[0].toStatus, "OPEN");
  assert.equal(detail.body.data.provider, "mock");
  assert.equal((await get("/customer/bookings?status=COMPLETED", owner.token)).body.data.items.length, 0);
  for (const query of ["limit=101", "limit=-1", "status=INVALID", `customerId=${other.id}`, "before=abc"]) {
    assert.equal((await get(`/customer/bookings?${query}`, owner.token)).status, 400, query);
  }
});
test("TASK-86: nearby feed protects contacts, excludes far/expired requests, stale GPS fails", async () => {
  const owner = await actor(), driver = await actor("DRIVER"), other = await actor("DRIVER");
  const booking = await newBooking(owner);
  const far = await newBooking(owner, { pickup: { lat: 10.8, lng: 106.7, address: "Điểm đón xa" } });
  const overdue = await newBooking(owner);
  await sql.execute("UPDATE booking_requests SET requested_departure_at = UTC_TIMESTAMP() - INTERVAL 1 SECOND WHERE id = ?", [overdue.id]);
  const nearby = await get("/driver/bookings/nearby?limit=100", driver.token);
  assert.equal(nearby.status, 200, JSON.stringify(nearby.body));
  const items = nearby.body.data.items;
  assert.ok(items.some(b => b.id === booking.id));
  assert.ok(!items.some(b => b.id === far.id || b.id === overdue.id));
  for (const item of items) {
    for (const field of ["contactName", "contactPhone", "customer_user_id", "customerId"]) assert.equal(field in item, false);
  }
  assert.equal((await get(`/driver/bookings/${booking.id}`, driver.token)).status, 404);
  await acceptBooking(driver, booking);
  assert.equal((await get(`/driver/bookings/${booking.id}`, driver.token)).body.data.contactPhone, "+84912345678");
  assert.equal((await get(`/driver/bookings/${booking.id}`, other.token)).status, 404);
  assert.equal((await get("/driver/bookings", driver.token)).body.data.items[0].id, booking.id);
  const ledger = await get("/driver/wallet/transactions", driver.token);
  assert.equal(ledger.body.data.items[0].amount, "-30000.00");
  assert.equal(ledger.body.data.items[0].bookingId, booking.id);
  await sql.execute("UPDATE driver_current_locations SET updated_at = UTC_TIMESTAMP() - INTERVAL 2 MINUTE WHERE driver_id = ?", [driver.driverId]);
  assert.equal((await get("/driver/bookings/nearby", driver.token)).status, 409);
});
test("TASK-86: profile updates cannot escalate roles; admin lookup excludes credentials", async () => {
  const customer = await actor(), admin = await actor("ADMIN"), booking = await newBooking(customer);
  assert.equal((await get("/customer/profile", customer.token)).body.data.id, customer.id);
  assert.equal((await request("/customer/profile", customer.token, { fullName: "Updated name", role: "ADMIN" }, "PATCH")).status, 400);
  assert.equal((await request("/customer/profile", customer.token, { fullName: "Updated name" }, "PATCH")).status, 200);
  assert.equal((await get("/customer/profile", customer.token)).body.data.fullName, "Updated name");
  assert.equal((await get("/admin/customers", customer.token)).status, 403);
  assert.equal((await get(`/admin/bookings/${booking.id}`, admin.token)).status, 200);
  const found = await get("/admin/customers?search=Updated%20name", admin.token);
  assert.ok(found.body.data.items.some(u => u.id === customer.id));
  for (const row of found.body.data.items) {
    assert.equal("password_hash" in row, false);
    assert.equal("refreshToken" in row, false);
  }
});
