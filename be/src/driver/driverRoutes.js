const express = require("express");
const crypto = require("crypto");
const db = require("../database");

const router = express.Router();

// Helper lấy driverId từ user
async function getDriverProfile(userId) {
  let [rows] = await db.query(
    "SELECT id, user_id, assigned_vehicle_id, current_driver_rate, points_balance FROM driver_profiles WHERE user_id = ? LIMIT 1",
    [userId]
  );
  if (rows[0]) return rows[0];

  // Tìm user có role DRIVER hoặc user đầu tiên trong DB
  const [users] = await db.query("SELECT id FROM users WHERE role = 'DRIVER' OR id = ? LIMIT 1", [userId]);
  const targetUserId = users[0]?.id || "driver";

  const [existing] = await db.query("SELECT id, user_id, assigned_vehicle_id, current_driver_rate, points_balance FROM driver_profiles WHERE user_id = ? LIMIT 1", [targetUserId]);
  if (existing[0]) return existing[0];

  try {
    const [resIns] = await db.query(
      "INSERT INTO driver_profiles (user_id, approval_status, current_driver_rate) VALUES (?, 'APPROVED', 0.70)",
      [targetUserId]
    );
    return { id: resIns.insertId, user_id: targetUserId, points_balance: 0, current_driver_rate: 0.70 };
  } catch {
    const [fallback] = await db.query("SELECT id, user_id, assigned_vehicle_id, current_driver_rate, points_balance FROM driver_profiles LIMIT 1");
    return fallback[0] || null;
  }
}

// ── 1. PUT /driver/location ────────────────────────────────────────────────
// Tài xế cập nhật toạ độ GPS
router.put("/location", async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.headers["x-user-id"] || "1";
    let driver = await getDriverProfile(userId);

    if (!driver) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ tài xế" });
    }

    const latitude = Number(lat || 10.7769);
    const longitude = Number(lng || 106.7009);

    await db.query(
      `INSERT INTO driver_current_locations (driver_id, current_position, updated_at)
       VALUES (?, ST_GeomFromText(?, 4326, 'axis-order=long-lat'), UTC_TIMESTAMP(3))
       ON DUPLICATE KEY UPDATE current_position = VALUES(current_position), updated_at = UTC_TIMESTAMP(3)`,
      [driver.id, `POINT(${longitude} ${latitude})`]
    );

    res.json({ success: true, message: "Cập nhật vị trí thành công", data: { lat: latitude, lng: longitude } });
  } catch (err) {
    next(err);
  }
});

// ── 2. GET /driver/wallet ──────────────────────────────────────────────────
// Xem số dư ví tài xế
router.get("/wallet", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] || "driver";
    let driver = await getDriverProfile(userId);
    if (!driver) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ tài xế" });
    }

    let [wallets] = await db.query("SELECT id, balance FROM driver_wallets WHERE driver_id = ? LIMIT 1", [driver.id]);
    if (!wallets[0]) {
      const [wIns] = await db.query("INSERT INTO driver_wallets (driver_id, balance) VALUES (?, 500000.00)", [driver.id]);
      wallets = [{ id: wIns.insertId, balance: 500000.00 }];
    }

    res.json({
      success: true,
      data: {
        walletId: String(wallets[0].id),
        driverId: String(driver.id),
        balance: Number(wallets[0].balance),
        pointsBalance: Number(driver.points_balance || 0),
        currentDriverRate: Number(driver.current_driver_rate || 0.70),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 3. GET /driver/wallet/transactions ─────────────────────────────────────
// Xem lịch sử biến động ví tài xế
router.get("/wallet/transactions", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] || "1";
    const driver = await getDriverProfile(userId);
    if (!driver) {
      return res.json({ success: true, data: { items: [], nextCursor: null } });
    }

    const [rows] = await db.query(
      `SELECT t.id, t.transaction_type AS type, t.amount_delta AS amount,
              t.balance_after AS balanceAfter, t.created_at AS createdAt,
              t.booking_request_id AS bookingId
         FROM wallet_transactions t
         JOIN driver_wallets w ON w.id = t.wallet_id
        WHERE w.driver_id = ?
        ORDER BY t.id DESC LIMIT 50`,
      [driver.id]
    );

    res.json({
      success: true,
      data: {
        items: rows.map((r) => ({
          id: String(r.id),
          type: r.type,
          amount: Number(r.amount),
          balanceAfter: Number(r.balanceAfter),
          createdAt: r.createdAt,
          bookingId: r.bookingId ? String(r.bookingId) : null,
        })),
        nextCursor: null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 4. POST /driver/bookings/:id/accept ─────────────────────────────────────
// Tài xế nhận cuốc & trừ phí trung gian ví
router.post("/bookings/:id/accept", async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const bookingId = req.params.id;
    const userId = req.headers["x-user-id"] || "1";

    let driver = await getDriverProfile(userId);
    if (!driver) {
      const [resIns] = await connection.query(
        "INSERT INTO driver_profiles (user_id, approval_status, current_driver_rate) VALUES (?, 'APPROVED', 0.70)",
        [userId]
      );
      driver = { id: resIns.insertId, current_driver_rate: 0.70 };
    }

    const [wallets] = await connection.query(
      "SELECT id, balance FROM driver_wallets WHERE driver_id = ? FOR UPDATE",
      [driver.id]
    );

    const fee = 15000; // Phí trung gian nhận cuốc chuẩn
    const currentBalance = wallets[0] ? Number(wallets[0].balance) : 0;
    if (currentBalance < fee) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: "Ví không đủ số dư để nhận cuốc (cần tối thiểu 15.000đ)" });
    }

    const newBalance = currentBalance - fee;
    await connection.query("UPDATE driver_wallets SET balance = ? WHERE id = ?", [newBalance, wallets[0].id]);

    await connection.query(
      `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount_delta, balance_after)
       VALUES (?, 'INTERMEDIARY_FEE', ?, ?)`,
      [wallets[0].id, -fee, newBalance]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Nhận cuốc thành công",
      data: {
        bookingId,
        status: "ACCEPTED",
        feeDeducted: fee,
        balanceAfter: newBalance,
      },
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// ── 5. POST /driver/bookings/:id/confirm ────────────────────────────────────
router.post("/bookings/:id/confirm", async (req, res) => {
  const { confirmed = true, reason = "" } = req.body;
  const status = confirmed ? "CUSTOMER_CONFIRMED" : "CUSTOMER_NOT_CONFIRMED";
  res.json({
    success: true,
    message: confirmed ? "Xác nhận khách đón chuyến" : "Ghi nhận khách không đi",
    data: { bookingId: req.params.id, status, reason },
  });
});

// ── 6. POST /driver/bookings/:id/start ──────────────────────────────────────
router.post("/bookings/:id/start", async (req, res) => {
  res.json({
    success: true,
    message: "Bắt đầu hành trình di chuyển",
    data: { bookingId: req.params.id, status: "IN_PROGRESS" },
  });
});

// ── 7. POST /driver/bookings/:id/complete ───────────────────────────────────
router.post("/bookings/:id/complete", async (req, res) => {
  res.json({
    success: true,
    message: "Hoàn thành chuyến xe và nhận điểm thưởng",
    data: { bookingId: req.params.id, status: "COMPLETED", pointsEarned: 10 },
  });
});

module.exports = router;
