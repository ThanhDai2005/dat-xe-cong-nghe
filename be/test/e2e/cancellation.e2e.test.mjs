import test from "node:test";
import assert from "node:assert/strict";
import { sql, actor, request, newBooking, acceptBooking, key } from "./booking-helpers.mjs";
test.after(() => sql.end());

test("TASK-83: only owner may cancel OPEN, reason is mandatory, replay has one event", async () => {
  const customer = await actor(), other = await actor(), driver = await actor("DRIVER");
  const booking = await newBooking(customer), path = `/customer/bookings/${booking.id}/cancel`;
  const body = { reason: "Khách thay đổi kế hoạch" }, op = key();
  assert.equal((await request(path, other.token, body)).status, 404);
  assert.equal((await request(path, driver.token, body)).status, 403);
  assert.equal((await request(path, customer.token, { reason: "" })).status, 400);
  assert.equal((await request(path, customer.token, body, "POST", op)).body.data.status, "CLOSE");
  assert.equal((await request(path, customer.token, body, "POST", op)).status, 200);
  assert.equal((await request(path, customer.token, body)).status, 409);
  assert.equal((await request(`/driver/bookings/${booking.id}/accept`, driver.token)).status, 409);
  const [events] = await sql.execute("SELECT * FROM booking_events WHERE booking_id = ? AND to_status = 'CLOSE'", [booking.id]);
  assert.equal(events.length, 1);
  assert.equal(events[0].actor_user_id, customer.id);
  assert.equal(events[0].reason, body.reason);
  const accepted = await newBooking(customer);
  await acceptBooking(driver, accepted);
  assert.equal((await request(`/customer/bookings/${accepted.id}/cancel`, customer.token, body)).status, 409);
});
test("TASK-83: accept versus cancel race leaves one valid outcome and correct ledger", async () => {
  const customer = await actor(), driver = await actor("DRIVER"), booking = await newBooking(customer);
  const results = await Promise.all([
    request(`/customer/bookings/${booking.id}/cancel`, customer.token, { reason: "Khách hủy trước khi nhận" }),
    request(`/driver/bookings/${booking.id}/accept`, driver.token),
  ]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  const [rows] = await sql.execute("SELECT status FROM booking_requests WHERE id = ?", [booking.id]);
  const [fees] = await sql.execute("SELECT id FROM wallet_transactions WHERE booking_request_id = ?", [booking.id]);
  const [wallets] = await sql.execute("SELECT balance FROM driver_wallets WHERE driver_id = ?", [driver.driverId]);
  assert.equal(fees.length, rows[0].status === "ACCEPTED" ? 1 : 0);
  assert.equal(wallets[0].balance, rows[0].status === "ACCEPTED" ? "170000.00" : "200000.00");
});
test("TASK-83: only admin refunds full original fee once, with immutable audit", async () => {
  const admin = await actor("ADMIN"), admin2 = await actor("ADMIN"), customer = await actor(), driver = await actor("DRIVER");
  const booking = await newBooking(customer), path = `/admin/bookings/${booking.id}/fee-refund`, body = { reason: "Điều chỉnh phí sau khi đối soát" };
  assert.equal((await request(path, admin.token, body)).body.code, "NO_REFUNDABLE_FEE");
  await acceptBooking(driver, booking);
  await request(`/driver/bookings/${booking.id}/confirm`, driver.token, { confirmed: false, reason: "Khách không đi chuyến này" });
  assert.equal((await request(path, driver.token, body)).status, 403);
  assert.equal((await request(path, admin.token, {})).status, 400);
  assert.equal((await request(path, admin.token, { ...body, amount: "999999" })).status, 400);
  const ops = [key(), key()];
  const results = await Promise.all([admin, admin2].map((a, i) => request(path, a.token, body, "POST", ops[i])));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  const winner = results.findIndex(r => r.status === 200), token = [admin, admin2][winner].token;
  assert.equal((await request(path, token, body, "POST", ops[winner])).status, 200);
  const [wallets] = await sql.execute("SELECT balance FROM driver_wallets WHERE driver_id = ?", [driver.driverId]);
  assert.equal(wallets[0].balance, "200000.00");
  const [refunds] = await sql.execute("SELECT * FROM fee_refunds WHERE booking_id = ?", [booking.id]);
  assert.equal(refunds.length, 1);
  assert.equal(refunds[0].reason, body.reason);
  const [original] = await sql.execute("SELECT amount_delta FROM wallet_transactions WHERE booking_request_id = ?", [booking.id]);
  assert.equal(original[0].amount_delta, "-30000.00");
  const [b] = await sql.execute("SELECT status FROM booking_requests WHERE id = ?", [booking.id]);
  assert.equal(b[0].status, "CUSTOMER_NOT_CONFIRMED");
});
