const express = require("express");
const crypto = require("crypto");
const db = require("../database");

const router = express.Router();

// Helper lấy user từ Authorization header nếu có
const getUser = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7).trim();
      const { verifyAccessToken } = require("../auth/tokenService");
      // synchronous verify or cached
      const jwt = require("jsonwebtoken");
      const decoded = jwt.decode(token);
      return decoded ? { id: decoded.userId || decoded.sub || decoded.id } : null;
    } catch {
      return null;
    }
  }
  return null;
};

// ── 1. GET /routes/search ──────────────────────────────────────────────────
// Tìm kiếm tuyến đường theo điểm đi và điểm đến
// Query: { from: string, to: string }
// Response: { success: true, data: [ { routeId, origin, destination, distance } ] }
router.get("/routes/search", async (req, res, next) => {
  try {
    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();
    const conditions = ["status = 'ACTIVE'"];
    const params = [];

    if (from) {
      conditions.push("origin LIKE ?");
      params.push(`%${from}%`);
    }
    if (to) {
      conditions.push("destination LIKE ?");
      params.push(`%${to}%`);
    }

    const [rows] = await db.query(
      `SELECT id AS routeId, origin, destination, distance,
              estimated_duration AS estimatedDuration
         FROM routes
        WHERE ${conditions.join(" AND ")}
        ORDER BY origin, destination`,
      params
    );

    res.json({
      success: true,
      data: rows.map((r) => ({
        routeId: String(r.routeId),
        origin: r.origin,
        destination: r.destination,
        distance: Number(r.distance),
        estimatedDuration: Number(r.estimatedDuration || 120),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ── 2. GET /trips/search ───────────────────────────────────────────────────
// Tìm kiếm chuyến xe khả dụng theo tuyến và ngày đi
// Query: { routeId: string, date: string, seats: number }
// Response: { success: true, data: [ { tripId, routeName, departureTime, vehicleTypeName, price, ... } ] }
router.get("/trips/search", async (req, res, next) => {
  try {
    const { routeId, date, seats = 1 } = req.query;
    const seatRequirement = Math.max(1, Number(seats) || 1);
    const conditions = ["t.status = 'OPEN'"];
    const params = [];

    if (routeId) {
      conditions.push("t.route_id = ?");
      params.push(routeId);
    }
    if (date) {
      conditions.push("DATE(t.departure_time) = ?");
      params.push(date);
    } else {
      // Mặc định chuyến trong tương lai
      conditions.push("t.departure_time >= NOW()");
    }

    const [rows] = await db.query(
      `SELECT t.id AS tripId, t.departure_time AS departureTime, t.price,
              r.origin, r.destination, r.estimated_duration AS estimatedDuration,
              v.license_plate AS licensePlate, v.seat_count AS totalSeats,
              vt.type_name AS vehicleTypeName,
              COUNT(CASE WHEN b.booking_status = 'CONFIRMED' OR
                (b.booking_status = 'PENDING' AND b.expires_at > CURRENT_TIMESTAMP(3))
                THEN bs.seat_number END) AS bookedSeats
         FROM trips t
         JOIN routes r ON r.id = t.route_id
         JOIN vehicles v ON v.id = t.vehicle_id
         LEFT JOIN vehicle_types vt ON vt.id = v.vehicle_type_id
         LEFT JOIN booking_seats bs ON bs.trip_id = t.id
         LEFT JOIN bookings b ON b.id = bs.booking_id
        WHERE ${conditions.join(" AND ")}
        GROUP BY t.id, t.departure_time, t.price, r.origin, r.destination,
                 r.estimated_duration, v.license_plate, v.seat_count, vt.type_name
        ORDER BY t.departure_time ASC`,
      params
    );

    const availableTrips = rows
      .map((r) => {
        const total = Number(r.totalSeats);
        const booked = Number(r.bookedSeats);
        const available = Math.max(0, total - booked);
        return {
          tripId: String(r.tripId),
          routeName: `${r.origin} → ${r.destination}`,
          origin: r.origin,
          destination: r.destination,
          departureTime: r.departureTime,
          vehicleTypeName: r.vehicleTypeName || "Tiêu chuẩn",
          licensePlate: r.licensePlate,
          price: Number(r.price || 0),
          totalSeats: total,
          bookedSeats: booked,
          availableSeats: available,
          estimatedDuration: Number(r.estimatedDuration || 120),
        };
      })
      .filter((t) => t.availableSeats >= seatRequirement);

    res.json({ success: true, data: availableTrips });
  } catch (err) {
    next(err);
  }
});

// ── 3. GET /trips/:id ──────────────────────────────────────────────────────
// Xem thông tin chi tiết chuyến xe (kèm điểm đón/trả của tuyến)
// Params: { id: string }
// Response: { success: true, data: { tripId, route, vehicle, price, schedule, pickupPoints, dropoffPoints } }
router.get("/trips/:id", async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const [tRows] = await db.query(
      `SELECT t.id AS tripId, t.departure_time AS departureTime, t.price, t.status,
              r.id AS routeId, r.origin, r.destination, r.distance, r.estimated_duration AS estimatedDuration,
              v.license_plate AS licensePlate, v.seat_count AS totalSeats,
              vt.type_name AS vehicleTypeName
         FROM trips t
         JOIN routes r ON r.id = t.route_id
         JOIN vehicles v ON v.id = t.vehicle_id
         LEFT JOIN vehicle_types vt ON vt.id = v.vehicle_type_id
        WHERE t.id = ? LIMIT 1`,
      [tripId]
    );

    if (!tRows[0]) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chuyến xe" });
    }

    const t = tRows[0];

    // Lấy các điểm đón / trả của tuyến đường
    const [stops] = await db.query(
      `SELECT id AS stopId, stop_name AS stopName, address, type, stop_order AS stopOrder
         FROM stops
        WHERE route_id = ? AND status = 'ACTIVE'
        ORDER BY stop_order ASC`,
      [t.routeId]
    );

    const pickupPoints = stops.filter((s) => s.type === "PICKUP" || s.type === "BOTH");
    const dropoffPoints = stops.filter((s) => s.type === "DROPOFF" || s.type === "BOTH");

    res.json({
      success: true,
      data: {
        tripId: String(t.tripId),
        route: {
          routeId: String(t.routeId),
          origin: t.origin,
          destination: t.destination,
          distance: Number(t.distance),
          estimatedDuration: Number(t.estimatedDuration),
        },
        vehicle: {
          licensePlate: t.licensePlate,
          totalSeats: Number(t.totalSeats),
          vehicleTypeName: t.vehicleTypeName || "Tiêu chuẩn",
        },
        price: Number(t.price || 0),
        schedule: {
          departureTime: t.departureTime,
          status: t.status,
        },
        pickupPoints: pickupPoints.map((s) => ({
          stopId: String(s.stopId),
          stopName: s.stopName,
          address: s.address,
          stopOrder: s.stopOrder,
        })),
        dropoffPoints: dropoffPoints.map((s) => ({
          stopId: String(s.stopId),
          stopName: s.stopName,
          address: s.address,
          stopOrder: s.stopOrder,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 4. GET /trips/:id/seats ────────────────────────────────────────────────
// Kiểm tra chỗ trống và sơ đồ ghế
// Params: { id: string }
// Response: { success: true, data: { tripId, totalSeats, bookedSeats, availableSeats, seatMap: [...] } }
router.get("/trips/:id/seats", async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const [tRows] = await db.query(
      `SELECT t.id, v.seat_count AS totalSeats
         FROM trips t JOIN vehicles v ON v.id = t.vehicle_id
        WHERE t.id = ? LIMIT 1`,
      [tripId]
    );

    if (!tRows[0]) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chuyến xe" });
    }

    const totalSeats = Number(tRows[0].totalSeats);

    // Ghế đã được đặt
    const [bookedRows] = await db.query(
      `SELECT bs.seat_number
         FROM booking_seats bs
         JOIN bookings b ON b.id = bs.booking_id
        WHERE bs.trip_id = ?
          AND (b.booking_status = 'CONFIRMED' OR (b.booking_status = 'PENDING' AND b.expires_at > CURRENT_TIMESTAMP(3)))`,
      [tripId]
    );

    const bookedSet = new Set(bookedRows.map((r) => String(r.seat_number)));
    const seatMap = [];

    for (let i = 1; i <= totalSeats; i++) {
      const seatNo = String(i);
      seatMap.push({
        seatNumber: seatNo,
        isBooked: bookedSet.has(seatNo),
      });
    }

    const bookedCount = bookedSet.size;
    const availableCount = Math.max(0, totalSeats - bookedCount);

    res.json({
      success: true,
      data: {
        tripId: String(tripId),
        totalSeats,
        bookedSeats: bookedCount,
        availableSeats: availableCount,
        seatMap,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 5. POST /bookings ──────────────────────────────────────────────────────
// Tạo đơn đặt chuyến mới (Giữ chỗ, chọn điểm, tính giá)
// Body: { customerId, tripId, seatNumbers, pickupPointId, dropoffPointId, bookingTypeId, customerName, contactPhone, driverNote }
// Response: { success: true, message: "Tạo đơn đặt thành công", data: { bookingId, totalFare, paymentStatus, expiresAt } }
router.post("/bookings", async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customerId,
      tripId,
      seatNumbers,
      pickupPointId,
      dropoffPointId,
      bookingTypeId,
      customerName,
      contactPhone,
      driverNote = "",
    } = req.body;

    if (!tripId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn chuyến xe và ít nhất một ghế ngồi",
      });
    }

    // 1. Kiểm tra chuyến xe
    const [tripRows] = await connection.query(
      `SELECT t.id, t.price, t.status, t.route_id, v.vehicle_type_id
         FROM trips t JOIN vehicles v ON v.id = t.vehicle_id
        WHERE t.id = ? FOR UPDATE`,
      [tripId]
    );

    if (!tripRows[0]) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Chuyến xe không tồn tại" });
    }

    const trip = tripRows[0];
    if (trip.status !== "OPEN") {
      await connection.rollback();
      return res.status(409).json({ success: false, message: "Chuyến xe đã đóng hoặc bị hủy" });
    }

    // 2. Kiểm tra ghế trùng
    const placeholders = seatNumbers.map(() => "?").join(",");
    const [conflictRows] = await connection.query(
      `SELECT bs.seat_number
         FROM booking_seats bs
         JOIN bookings b ON b.id = bs.booking_id
        WHERE bs.trip_id = ?
          AND bs.seat_number IN (${placeholders})
          AND (b.booking_status = 'CONFIRMED' OR (b.booking_status = 'PENDING' AND b.expires_at > CURRENT_TIMESTAMP(3)))
        FOR UPDATE`,
      [tripId, ...seatNumbers.map(String)]
    );

    if (conflictRows.length > 0) {
      await connection.rollback();
      const conflictSeats = conflictRows.map((r) => r.seat_number).join(", ");
      return res.status(409).json({
        success: false,
        message: `Các ghế sau đã có người đặt: ${conflictSeats}. Vui lòng chọn ghế khác`,
      });
    }

    // 3. Tính giá vé
    let farePerSeat = Number(trip.price || 0);
    if (bookingTypeId) {
      const [fareRows] = await connection.query(
        `SELECT base_price FROM fares
          WHERE route_id = ? AND booking_type_id = ? AND is_active = 1
          ORDER BY (vehicle_type_id = ?) DESC LIMIT 1`,
        [trip.route_id, bookingTypeId, trip.vehicle_type_id]
      );
      if (fareRows[0] && Number(fareRows[0].base_price) > 0) {
        farePerSeat = Number(fareRows[0].base_price);
      }
    }

    const seatCount = seatNumbers.length;
    const totalFare = farePerSeat * seatCount;
    const bookingId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Giữ chỗ 15 phút

    // Lấy tên địa chỉ điểm đón/trả nếu có ID hoặc tìm điểm mặc định của tuyến
    let finalPickupId = pickupPointId;
    let finalDropoffId = dropoffPointId;
    let finalBookingTypeId = bookingTypeId;
    let pickupAddress = "";
    let dropoffAddress = "";

    if (pickupPointId) {
      const [s] = await connection.query("SELECT stop_name, address FROM stops WHERE id = ?", [pickupPointId]);
      if (s[0]) pickupAddress = `${s[0].stop_name} (${s[0].address})`;
    } else {
      const [s] = await connection.query("SELECT id, stop_name, address FROM stops WHERE route_id = ? AND type IN ('PICKUP', 'BOTH') ORDER BY stop_order ASC LIMIT 1", [trip.route_id]);
      if (s[0]) {
        finalPickupId = s[0].id;
        pickupAddress = `${s[0].stop_name} (${s[0].address})`;
      } else {
        const [anyStop] = await connection.query("SELECT id FROM stops WHERE route_id = ? LIMIT 1", [trip.route_id]);
        finalPickupId = anyStop[0]?.id || 1;
      }
    }

    if (dropoffPointId) {
      const [s] = await connection.query("SELECT stop_name, address FROM stops WHERE id = ?", [dropoffPointId]);
      if (s[0]) dropoffAddress = `${s[0].stop_name} (${s[0].address})`;
    } else {
      const [s] = await connection.query("SELECT id, stop_name, address FROM stops WHERE route_id = ? AND type IN ('DROPOFF', 'BOTH') ORDER BY stop_order DESC LIMIT 1", [trip.route_id]);
      if (s[0]) {
        finalDropoffId = s[0].id;
        dropoffAddress = `${s[0].stop_name} (${s[0].address})`;
      } else {
        const [anyStop] = await connection.query("SELECT id FROM stops WHERE route_id = ? LIMIT 1", [trip.route_id]);
        finalDropoffId = anyStop[0]?.id || 1;
      }
    }

    if (!finalBookingTypeId) {
      const [bt] = await connection.query("SELECT id FROM booking_types WHERE is_active = 1 LIMIT 1");
      finalBookingTypeId = bt[0]?.id || 1;
    }

    // Xác định ID khách hàng
    const userFromToken = getUser(req);
    const finalCustomerId = customerId || userFromToken?.id || "GUEST_CUSTOMER";

    // 4. Insert booking
    await connection.query(
      `INSERT INTO bookings
         (id, customer_id, trip_id, pickup_point_id, dropoff_point_id, booking_type_id,
          seat_count, fare_per_seat, total_fare, booking_status, payment_status,
          expires_at, customer_name, contact_phone, driver_note, pickup_address, dropoff_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING', ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        finalCustomerId,
        tripId,
        finalPickupId,
        finalDropoffId,
        finalBookingTypeId,
        seatCount,
        farePerSeat,
        totalFare,
        expiresAt,
        customerName || "Khách hàng",
        contactPhone || "",
        driverNote || "",
        pickupAddress,
        dropoffAddress,
      ]
    );

    // 5. Insert booking_seats
    for (const seatNo of seatNumbers) {
      await connection.query(
        "INSERT INTO booking_seats (booking_id, trip_id, seat_number) VALUES (?, ?, ?)",
        [bookingId, tripId, String(seatNo)]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Tạo đơn đặt chuyến thành công. Vui lòng thanh toán trong vòng 15 phút.",
      data: {
        bookingId,
        totalFare,
        seatCount,
        farePerSeat,
        seatNumbers,
        paymentStatus: "PENDING",
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// ── 6. POST /payments/process ──────────────────────────────────────────────
// Xử lý thanh toán giả lập cho đơn đặt chuyến
// Body: { bookingId, paymentMethod, amount }
// Response: { success: true, message: "Thanh toán thành công", data: { transactionId, status: "SUCCESS" } }
router.post("/payments/process", async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { bookingId, paymentMethod = "VNPAY", amount } = req.body;
    if (!bookingId) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "bookingId không được để trống" });
    }

    const [bRows] = await connection.query(
      "SELECT id, total_fare, booking_status, payment_status FROM bookings WHERE id = ? FOR UPDATE",
      [bookingId]
    );

    if (!bRows[0]) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Đơn đặt xe không tồn tại" });
    }

    const b = bRows[0];
    if (b.payment_status === "PAID") {
      await connection.rollback();
      return res.status(200).json({
        success: true,
        message: "Đơn đặt xe đã được thanh toán trước đó",
        data: { bookingId, status: "SUCCESS" },
      });
    }

    const payAmount = Number(amount || b.total_fare);
    const transactionId = crypto.randomUUID();
    const validMethod = ["CASH", "CARD", "MOMO", "VNPAY", "BANK_TRANSFER"].includes(paymentMethod.toUpperCase())
      ? paymentMethod.toUpperCase()
      : "VNPAY";

    // Insert payment record
    await connection.query(
      `INSERT INTO payments (id, booking_id, payment_method, amount, status, paid_at)
       VALUES (?, ?, ?, ?, 'SUCCESS', CURRENT_TIMESTAMP(3))`,
      [transactionId, bookingId, validMethod, payAmount]
    );

    // Update booking status
    await connection.query(
      `UPDATE bookings
          SET payment_status = 'PAID', booking_status = 'CONFIRMED'
        WHERE id = ?`,
      [bookingId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Xử lý thanh toán thành công",
      data: {
        transactionId,
        bookingId,
        amount: payAmount,
        status: "SUCCESS",
      },
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// ── 7. GET /my-bookings ────────────────────────────────────────────────────
// Xem lịch sử đặt vé của khách hàng
// Query: { customerId?: string, status?: string }
// Response: { success: true, data: [ { bookingId, tripInfo, totalFare, status, bookingDate } ] }
router.get("/my-bookings", async (req, res, next) => {
  try {
    const user = getUser(req);
    const customerId = req.query.customerId || user?.id;
    const status = req.query.status;

    const conditions = [];
    const params = [];

    if (customerId) {
      conditions.push("b.customer_id = ?");
      params.push(customerId);
    }
    if (status) {
      conditions.push("b.booking_status = ?");
      params.push(status);
    }

    const [rows] = await db.query(
      `SELECT b.id AS bookingId, b.total_fare AS totalFare, b.booking_status AS status,
              b.payment_status AS paymentStatus, b.created_at AS bookingDate,
              b.seat_count AS seatCount, b.customer_name AS customerName,
              r.origin, r.destination, t.departure_time AS departureTime,
              GROUP_CONCAT(bs.seat_number ORDER BY bs.seat_number ASC SEPARATOR ', ') AS seatsList
         FROM bookings b
         JOIN trips t ON t.id = b.trip_id
         JOIN routes r ON r.id = t.route_id
         LEFT JOIN booking_seats bs ON bs.booking_id = b.id
        ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
        GROUP BY b.id, b.total_fare, b.booking_status, b.payment_status, b.created_at,
                 b.seat_count, b.customer_name, r.origin, r.destination, t.departure_time
        ORDER BY b.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: rows.map((r) => ({
        bookingId: r.bookingId,
        tripInfo: `${r.origin} → ${r.destination} (${new Date(r.departureTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })})`,
        origin: r.origin,
        destination: r.destination,
        departureTime: r.departureTime,
        seats: r.seatsList ? r.seatsList.split(", ") : [],
        totalFare: Number(r.totalFare),
        status: r.status,
        paymentStatus: r.paymentStatus,
        bookingDate: r.bookingDate,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ── 8. POST /bookings/:id/cancel ───────────────────────────────────────────
// Khách hàng yêu cầu hủy đơn (hợp nhất từ TASK-83)
router.post("/bookings/:id/cancel", async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const reason = String(req.body?.reason || "Khách yêu cầu hủy").trim();

    const [result] = await db.query(
      "INSERT INTO cancellation_requests (booking_id, requested_by, reason, status) VALUES (?, 'CUSTOMER', ?, 'PENDING')",
      [bookingId, reason]
    );

    res.json({
      success: true,
      message: "Đã ghi nhận yêu cầu hủy vé của quý khách",
      data: {
        requestId: String(result.insertId),
        bookingId,
        status: "PENDING",
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
