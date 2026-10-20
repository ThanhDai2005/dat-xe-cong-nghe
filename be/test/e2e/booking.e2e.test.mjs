import test from "node:test";
import assert from "node:assert/strict";
import { sql, actor, request, newBooking, acceptBooking, key } from "./booking-helpers.mjs";

test.after(() => sql.end());
test("TASK-80: concurrent acceptance charges exactly one driver, replay is stable", async () => {
  const customer = await actor(), a = await actor("DRIVER"), b = await actor("DRIVER");
  const booking = await newBooking(customer);
  const replay = await request("/customer/bookings", customer.token, booking.createBody, "POST", booking.createKey);
  assert.equal(replay.body.data.bookingId, booking.id);
  assert.equal((await request("/customer/bookings", customer.token, booking.createBody)).status, 409);
  const acceptKey = key();
  const results = await Promise.all([a, b].map(d => request(`/driver/bookings/${booking.id}/accept`, d.token, {}, "POST", acceptKey)));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  const winner = results[0].status === 200 ? a : b;
  const again = await request(`/driver/bookings/${booking.id}/accept`, winner.token, {}, "POST", acceptKey);
  assert.equal(again.status, 200);
  assert.equal(again.body.data.fee, "30000.00");
  const [fees] = await sql.execute("SELECT * FROM wallet_transactions WHERE booking_request_id = ?", [booking.id]);
  assert.equal(fees.length, 1);
  assert.equal(fees[0].amount_delta, "-30000.00");
  const [wallets] = await sql.execute("SELECT balance FROM driver_wallets WHERE driver_id IN (?, ?) ORDER BY balance", [a.driverId, b.driverId]);
  assert.deepEqual(wallets.map(w => w.balance), ["170000.00", "200000.00"]);
  assert.equal((await request(`/driver/bookings/${booking.id}/complete`, winner.token, { paymentConfirmed: true })).status, 409);
  assert.equal((await request(`/driver/bookings/${booking.id}/confirm`, winner.token, { confirmed: true })).status, 200);
  assert.equal((await request(`/driver/bookings/${booking.id}/start`, winner.token)).status, 200);
  const completions = await Promise.all([1, 2].map(() => request(`/driver/bookings/${booking.id}/complete`, winner.token, { paymentConfirmed: true })));
  assert.deepEqual(completions.map(r => r.status), [200, 200]);
  const [drivers] = await sql.execute("SELECT points_balance,current_driver_rate FROM driver_profiles WHERE id = ?", [winner.driverId]);
  assert.equal(Number(drivers[0].points_balance), 10);
  assert.equal(drivers[0].current_driver_rate, "0.7100");
  const [events] = await sql.execute("SELECT id FROM booking_events WHERE booking_id = ? AND to_status = 'COMPLETED'", [booking.id]);
  assert.equal(events.length, 1);
});
test("TASK-80: missing balance and stale GPS leave booking and wallet unchanged", async () => {
  const customer = await actor(), driver = await actor("DRIVER", "0.00");
  const booking = await newBooking(customer);
  const result = await request(`/driver/bookings/${booking.id}/accept`, driver.token);
  assert.equal(result.body.code, "INSUFFICIENT_BALANCE");
  const [b] = await sql.execute("SELECT status,accepted_driver_id FROM booking_requests WHERE id = ?", [booking.id]);
  assert.equal(b[0].status, "OPEN");
  assert.equal(b[0].accepted_driver_id, null);
  const [fees] = await sql.execute("SELECT id FROM wallet_transactions WHERE booking_request_id = ?", [booking.id]);
  assert.equal(fees.length, 0);
  await sql.execute("UPDATE driver_wallets SET balance = 200000 WHERE driver_id = ?", [driver.driverId]);
  await sql.execute("UPDATE driver_current_locations SET updated_at = UTC_TIMESTAMP() - INTERVAL 2 MINUTE WHERE driver_id = ?", [driver.driverId]);
  assert.equal((await request(`/driver/bookings/${booking.id}/accept`, driver.token)).body.code, "LOCATION_NOT_ELIGIBLE");
});
test("TASK-80: no-go retains fee and streak; failure after starting resets streak", async () => {
  const customer = await actor(), driver = await actor("DRIVER");
  await sql.execute("UPDATE driver_profiles SET current_driver_rate = .75 WHERE id = ?", [driver.driverId]);
  const noGo = await newBooking(customer);
  await acceptBooking(driver, noGo);
  assert.equal((await request(`/driver/bookings/${noGo.id}/confirm`, driver.token, { confirmed: false, reason: "Khách báo không đi" })).status, 200);
  let [rows] = await sql.execute("SELECT current_driver_rate FROM driver_profiles WHERE id = ?", [driver.driverId]);
  assert.equal(rows[0].current_driver_rate, "0.7500");
  const failure = await newBooking(customer);
  await acceptBooking(driver, failure);
  await request(`/driver/bookings/${failure.id}/confirm`, driver.token, { confirmed: true });
  await request(`/driver/bookings/${failure.id}/start`, driver.token);
  assert.equal((await request(`/driver/bookings/${failure.id}/fail`, driver.token, { reason: "Xe hỏng giữa hành trình" })).status, 200);
  [rows] = await sql.execute("SELECT current_driver_rate, points_balance FROM driver_profiles WHERE id = ?", [driver.driverId]);
  assert.equal(rows[0].current_driver_rate, "0.7000");
  assert.equal(Number(rows[0].points_balance), 0);
});
test("TASK-80: only admin credits wallet, reference and operation are unique", async () => {
  const admin = await actor("ADMIN"), driver = await actor("DRIVER"), customer = await actor();
  const path = `/admin/drivers/${driver.driverId}/wallet/credits`;
  const body = { amount: "100000", reference: key(), reason: "Đã đối soát chuyển khoản" }, op = key();
  assert.equal((await request(path, customer.token, body)).status, 403);
  assert.equal((await request(path, admin.token, body, "POST", op)).status, 201);
  assert.equal((await request(path, admin.token, body, "POST", op)).status, 201);
  assert.equal((await request(path, admin.token, body)).status, 409);
  assert.equal((await request(path, admin.token, { ...body, amount: "200000" }, "POST", op)).status, 409);
  const [rows] = await sql.execute("SELECT balance FROM driver_wallets WHERE driver_id = ?", [driver.driverId]);
  assert.equal(rows[0].balance, "300000.00");
});
test("TASK-80: authenticated roles, trusted pricing and departure validation", async () => {
  const customer = await actor();
  assert.equal((await request("/customer/bookings", null, {})).status, 401);
  assert.equal((await request("/driver/bookings/1/accept", customer.token)).status, 403);
  const input = { pickup: { lat: 21.03, lng: 105.85, address: "Điểm đón" }, destination: { lat: 21.1, lng: 106.1, address: "Điểm trả" },
    departureAt: new Date(Date.now() + 4 * 3600_000).toISOString(), seatCount: 2 };
  assert.equal((await request("/customer/quotes", customer.token, input)).body.code, "DEPARTURE_TOO_SOON");
  assert.equal((await request("/customer/quotes", customer.token, { ...input, farePerSeat: 1 })).status, 400);
});
test("TASK-80: quote ownership, expiry, missing operation key and suspended sessions", async () => {
  const customer = await actor(), stranger = await actor();
  const body = { pickup: { lat: 21.03, lng: 105.85, address: "Điểm đón" }, destination: { lat: 21.1, lng: 106.1, address: "Điểm trả" },
    departureAt: new Date(Date.now() + 8 * 3600_000).toISOString(), seatCount: 2 };
  const quoted = await request("/customer/quotes", customer.token, body);
  const create = { quoteId: quoted.body.data.quoteId, contactName: "Test customer", contactPhone: "0912345678" };
  assert.equal((await request("/customer/bookings", stranger.token, create)).status, 404);
  assert.equal((await request("/customer/bookings", customer.token, create, "POST", "")).status, 400);
  await sql.execute("UPDATE booking_quotes SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 SECOND WHERE id = ?", [create.quoteId]);
  assert.equal((await request("/customer/bookings", customer.token, create)).body.code, "QUOTE_EXPIRED");
  await sql.execute("UPDATE users SET status = 'SUSPENDED' WHERE id = ?", [customer.id]);
  assert.equal((await request("/customer/quotes", customer.token, body)).status, 403);
});
test("TASK-80: capacity, far GPS, overdue request and other driver are rejected; rate caps at 80%", async () => {
  const customer = await actor(), driver = await actor("DRIVER"), stranger = await actor("DRIVER");
  const booking = await newBooking(customer, { seatCount: 6 });
  await sql.execute("UPDATE vehicles v JOIN driver_profiles d ON d.assigned_vehicle_id = v.id SET v.seat_count = 5 WHERE d.id = ?", [driver.driverId]);
  assert.equal((await request(`/driver/bookings/${booking.id}/accept`, driver.token)).body.code, "VEHICLE_UNAVAILABLE");
  await sql.execute("UPDATE vehicles v JOIN driver_profiles d ON d.assigned_vehicle_id = v.id SET v.seat_count = 7 WHERE d.id = ?", [driver.driverId]);
  await request("/driver/location", driver.token, { lat: 10.8, lng: 106.7 }, "PUT");
  assert.equal((await request(`/driver/bookings/${booking.id}/accept`, driver.token)).body.code, "LOCATION_NOT_ELIGIBLE");
  await request("/driver/location", driver.token, { lat: 21.03, lng: 105.85 }, "PUT");
  await sql.execute("UPDATE driver_profiles SET current_driver_rate = .80 WHERE id = ?", [driver.driverId]);
  await acceptBooking(driver, booking);
  assert.equal((await request(`/driver/bookings/${booking.id}/confirm`, stranger.token, { confirmed: true })).status, 403);
  await request(`/driver/bookings/${booking.id}/confirm`, driver.token, { confirmed: true });
  await request(`/driver/bookings/${booking.id}/start`, driver.token);
  assert.equal((await request(`/driver/bookings/${booking.id}/complete`, driver.token, { paymentConfirmed: false })).status, 400);
  assert.equal((await request(`/driver/bookings/${booking.id}/complete`, driver.token, { paymentConfirmed: true })).status, 200);
  const [rows] = await sql.execute("SELECT current_driver_rate FROM driver_profiles WHERE id = ?", [driver.driverId]);
  assert.equal(rows[0].current_driver_rate, "0.8000");
  const overdue = await newBooking(customer);
  await sql.execute("UPDATE booking_requests SET requested_departure_at = UTC_TIMESTAMP() - INTERVAL 1 SECOND WHERE id = ?", [overdue.id]);
  assert.equal((await request(`/driver/bookings/${overdue.id}/accept`, driver.token)).body.code, "BOOKING_UNAVAILABLE");
});
test("TASK-80: imported admin CRUD uses shared auth and local schema", async () => {
  const admin = await actor("ADMIN"), customer = await actor();
  assert.equal((await request("/admin/vehicles", customer.token, undefined, "GET")).status, 403);
  for (const resource of ["vehicles", "routes", "stops", "commissions"]) {
    const result = await request(`/admin/${resource}`, admin.token, undefined, "GET");
    assert.equal(result.status, 200, `${resource}: ${JSON.stringify(result.body)}`);
  }
});
