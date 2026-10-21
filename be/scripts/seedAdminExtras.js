const db = require("../src/database");
const crypto = require("crypto");

async function seedExtras() {
  console.log("Seeding extra data for admin: stops, payments, cancellations, refunds...");

  // 1. Seed stops if few or none
  const [routes] = await db.query("SELECT id, origin, destination FROM routes LIMIT 10");
  for (const r of routes) {
    const [stops] = await db.query("SELECT id FROM stops WHERE route_id = ?", [r.id]);
    if (stops.length < 2) {
      await db.query(
        "INSERT INTO stops (route_id, stop_name, address, type, stop_order, status) VALUES (?, ?, ?, 'PICKUP', 1, 'ACTIVE')",
        [r.id, `Bến xe ${r.origin}`, `Khu vực trung tâm ${r.origin}`, 1],
      );
      await db.query(
        "INSERT INTO stops (route_id, stop_name, address, type, stop_order, status) VALUES (?, ?, ?, 'DROPOFF', 2, 'ACTIVE')",
        [r.id, `Bến xe ${r.destination}`, `Trung tâm thành phố ${r.destination}`, 2],
      );
      await db.query(
        "INSERT INTO stops (route_id, stop_name, address, type, stop_order, status) VALUES (?, ?, ?, 'BOTH', 3, 'ACTIVE')",
        [r.id, `Trạm trung chuyển cao tốc`, `Km 45 Trạm dừng chân`, 3],
      );
    }
  }

  // 2. Seed payments for bookings with payment_status = 'PAID' if not exists
  const [paidBookings] = await db.query(
    "SELECT id, total_fare, created_at FROM bookings WHERE payment_status = 'PAID'"
  );
  for (const b of paidBookings) {
    const [pm] = await db.query("SELECT id FROM payments WHERE booking_id = ?", [b.id]);
    if (pm.length === 0) {
      const methods = ["VNPAY", "MOMO", "BANK_TRANSFER", "CARD"];
      const chosenMethod = methods[Math.floor(Math.random() * methods.length)];
      await db.query(
        "INSERT INTO payments (id, booking_id, payment_method, amount, status, paid_at, created_at) VALUES (?, ?, ?, ?, 'SUCCESS', ?, ?)",
        [crypto.randomUUID(), b.id, chosenMethod, b.total_fare, b.created_at, b.created_at],
      );
    }
  }

  // 3. Seed sample cancellation request and refund
  const [pendingBookings] = await db.query(
    "SELECT id, total_fare, customer_name FROM bookings LIMIT 3"
  );
  if (pendingBookings.length >= 2) {
    const b1 = pendingBookings[0];
    const b2 = pendingBookings[1];

    const [c1] = await db.query("SELECT id FROM cancellation_requests WHERE booking_id = ?", [b1.id]);
    if (c1.length === 0) {
      await db.query(
        "INSERT INTO cancellation_requests (booking_id, requested_by, reason, status, created_at) VALUES (?, 'CUSTOMER', 'Khách hàng bận đột xuất thay đổi kế hoạch công tác', 'PENDING', NOW())",
        [b1.id],
      );
    }

    const [c2] = await db.query("SELECT id FROM cancellation_requests WHERE booking_id = ?", [b2.id]);
    if (c2.length === 0) {
      const penalty = Math.round(Number(b2.total_fare) * 0.1);
      const [insRes] = await db.query(
        "INSERT INTO cancellation_requests (booking_id, requested_by, reason, status, admin_id, reason_note, apply_commission_penalty, penalty_amount, created_at) VALUES (?, 'CUSTOMER', 'Khách báo hoãn chuyến trước 24h', 'APPROVED', 'ADMIN', 'Duyệt theo chính sách hoàn 90%', 1, ?, NOW())",
        [b2.id, penalty],
      );
      const refundAmt = Math.round(Number(b2.total_fare) * 0.9);
      await db.query(
        "INSERT INTO refunds (booking_id, cancellation_id, refund_percentage, final_refund_amount, status, created_at) VALUES (?, ?, 90.00, ?, 'REFUNDED', NOW())",
        [b2.id, insRes.insertId, refundAmt],
      );
    }
  }

  console.log("Seeding extra data completed successfully!");
  process.exit(0);
}

seedExtras().catch((err) => {
  console.error("Error seeding extras:", err);
  process.exit(1);
});
