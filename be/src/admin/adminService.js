const bcrypt = require("bcryptjs");
const { createHttpError } = require("../customer/bookingValidation");
const { positiveId, priceValue, fareInput, tripInput } = require("./adminValidation");
const { vietnamDayBounds } = require("../utils/vietnamTime");
const { signAccessToken, issueRefreshToken } = require("../auth/tokenService");

const getDatabase = (database) => database || require("../database");
const id = (value) => value === null || value === undefined ? null : String(value);

const withTransaction = async (database, operation) => {
  const connection = await getDatabase(database).getConnection();
  try {
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listRoutes = async (database) => {
  const [rows] = await getDatabase(database).query(
    `SELECT id AS routeId, origin, destination, distance,
            estimated_duration AS estimatedDuration, status
       FROM routes ORDER BY origin, destination, id`,
  );
  return rows.map((row) => ({ ...row, routeId: id(row.routeId), distance: Number(row.distance) }));
};

const listVehicles = async (database) => {
  const [rows] = await getDatabase(database).query(
    `SELECT v.id AS vehicleId, v.license_plate AS licensePlate,
            v.seat_count AS seatCount, v.vehicle_status AS status,
            v.vehicle_type_id AS vehicleTypeId, vt.type_name AS vehicleTypeName
       FROM vehicles v LEFT JOIN vehicle_types vt ON vt.id = v.vehicle_type_id
      ORDER BY v.license_plate, v.id`,
  );
  return rows.map((row) => ({ ...row, vehicleId: id(row.vehicleId), vehicleTypeId: id(row.vehicleTypeId), seatCount: Number(row.seatCount) }));
};

const listBookingTypes = async (database) => {
  const [rows] = await getDatabase(database).query(
    `SELECT id AS bookingTypeId, type_name AS typeName, description, is_active AS isActive
       FROM booking_types ORDER BY id`,
  );
  return rows.map((row) => ({ ...row, bookingTypeId: id(row.bookingTypeId), isActive: Boolean(row.isActive) }));
};

const listVehicleTypes = async (database) => {
  const [rows] = await getDatabase(database).query(
    `SELECT id AS vehicleTypeId, type_name AS typeName, is_active AS isActive
       FROM vehicle_types ORDER BY type_name, id`,
  );
  return rows.map((row) => ({ ...row, vehicleTypeId: id(row.vehicleTypeId), isActive: Boolean(row.isActive) }));
};

const assignVehicleType = async (vehicleId, body, database) => {
  const vehicle = positiveId(vehicleId, "vehicleId");
  const type = body?.vehicleTypeId === null || body?.vehicleTypeId === "" ? null
    : positiveId(body?.vehicleTypeId, "vehicleTypeId");
  const db = getDatabase(database);
  if (type) {
    const [types] = await db.query(
      "SELECT id FROM vehicle_types WHERE id = ? AND is_active = 1", [type],
    );
    if (!types[0]) throw createHttpError(404, "VEHICLE_TYPE_NOT_FOUND", "Loại xe không hoạt động");
  }
  const [result] = await db.query(
    "UPDATE vehicles SET vehicle_type_id = ? WHERE id = ?", [type, vehicle],
  );
  if (!result.affectedRows) throw createHttpError(404, "VEHICLE_NOT_FOUND", "Xe không tồn tại");
  return { vehicleId: vehicle, vehicleTypeId: type };
};

const createVehicleType = async (body, database) => {
  const typeName = String(body?.typeName ?? "").trim();
  if (!typeName || typeName.length > 100) throw createHttpError(400, "VALIDATION_ERROR", "typeName không hợp lệ");
  try {
    const [result] = await getDatabase(database).query(
      "INSERT INTO vehicle_types (type_name) VALUES (?)", [typeName],
    );
    return { vehicleTypeId: id(result.insertId), typeName };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw createHttpError(409, "VEHICLE_TYPE_EXISTS", "Loại xe đã tồn tại");
    throw error;
  }
};

const listFares = async (query = {}, database) => {
  const params = [];
  const conditions = [];
  if (query.routeId) { conditions.push("f.route_id = ?"); params.push(positiveId(query.routeId, "routeId")); }
  if (query.active !== "all") conditions.push("f.is_active = 1");
  const [rows] = await getDatabase(database).query(
    `SELECT f.id AS fareId, f.route_id AS routeId, f.booking_type_id AS bookingTypeId,
            f.vehicle_type_id AS vehicleTypeId, f.base_price AS basePrice,
            f.is_active AS isActive, r.origin, r.destination,
            bt.type_name AS bookingTypeName, vt.type_name AS vehicleTypeName
       FROM fares f JOIN routes r ON r.id = f.route_id
       JOIN booking_types bt ON bt.id = f.booking_type_id
       LEFT JOIN vehicle_types vt ON vt.id = f.vehicle_type_id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY r.origin, r.destination, bt.type_name, vt.type_name, f.id`,
    params,
  );
  return rows.map((row) => ({ ...row, fareId: id(row.fareId), routeId: id(row.routeId),
    bookingTypeId: id(row.bookingTypeId), vehicleTypeId: id(row.vehicleTypeId),
    basePrice: Number(row.basePrice), isActive: Boolean(row.isActive) }));
};

const createFare = async (body, database) => {
  const input = fareInput(body);
  return withTransaction(database, async (connection) => {
    const [routes] = await connection.query("SELECT id, status FROM routes WHERE id = ? FOR UPDATE", [input.routeId]);
    if (!routes[0] || routes[0].status !== "ACTIVE") throw createHttpError(404, "ROUTE_NOT_ACTIVE", "Tuyến đường không hoạt động");
    const [bookingTypes] = await connection.query("SELECT id FROM booking_types WHERE id = ? AND is_active = 1", [input.bookingTypeId]);
    if (!bookingTypes[0]) throw createHttpError(404, "BOOKING_TYPE_NOT_FOUND", "Hình thức đặt xe không hoạt động");
    if (input.vehicleTypeId) {
      const [vehicleTypes] = await connection.query("SELECT id FROM vehicle_types WHERE id = ? AND is_active = 1", [input.vehicleTypeId]);
      if (!vehicleTypes[0]) throw createHttpError(404, "VEHICLE_TYPE_NOT_FOUND", "Loại xe không hoạt động");
    }
    const [duplicates] = await connection.query(
      `SELECT id FROM fares WHERE route_id = ? AND booking_type_id = ?
        AND vehicle_type_id <=> ? AND is_active = 1 LIMIT 1`,
      [input.routeId, input.bookingTypeId, input.vehicleTypeId],
    );
    if (duplicates[0]) throw createHttpError(409, "FARE_EXISTS", "Bảng giá cho tổ hợp này đã tồn tại");
    const [result] = await connection.query(
      `INSERT INTO fares (route_id, booking_type_id, vehicle_type_id, base_price)
       VALUES (?, ?, ?, ?)`,
      [input.routeId, input.bookingTypeId, input.vehicleTypeId, input.basePrice],
    );
    return { fareId: id(result.insertId), basePrice: input.basePrice };
  });
};

const updateFare = async (fareId, body, database) => {
  const fare = positiveId(fareId, "fareId");
  const price = priceValue(body?.basePrice);
  const [result] = await getDatabase(database).query(
    "UPDATE fares SET base_price = ? WHERE id = ? AND is_active = 1", [price, fare],
  );
  if (!result.affectedRows) throw createHttpError(404, "FARE_NOT_FOUND", "Bảng giá không tồn tại");
  return { fareId: fare, basePrice: price };
};

const deleteFare = async (fareId, database) => {
  const fare = positiveId(fareId, "fareId");
  const [result] = await getDatabase(database).query(
    "UPDATE fares SET is_active = 0 WHERE id = ? AND is_active = 1", [fare],
  );
  if (!result.affectedRows) throw createHttpError(404, "FARE_NOT_FOUND", "Bảng giá không tồn tại");
};

const listTrips = async (query = {}, database) => {
  const params = [];
  const conditions = [];
  if (query.routeId) { conditions.push("t.route_id = ?"); params.push(positiveId(query.routeId, "routeId")); }
  if (query.date) {
    const [dayStart, dayEnd] = vietnamDayBounds(query.date);
    conditions.push("t.departure_time >= ? AND t.departure_time < ?"); params.push(dayStart, dayEnd);
  }
  if (query.status) {
    if (!["OPEN", "CLOSED", "CANCELLED"].includes(query.status)) throw createHttpError(400, "VALIDATION_ERROR", "status không hợp lệ");
    conditions.push("t.status = ?"); params.push(query.status);
  }
  const [rows] = await getDatabase(database).query(
    `SELECT t.id AS tripId, t.route_id AS routeId, t.vehicle_id AS vehicleId,
            t.departure_time AS departureTime, t.price, t.status,
            r.origin, r.destination, r.estimated_duration AS estimatedDuration,
            v.license_plate AS licensePlate, v.seat_count AS totalSeats,
            COUNT(CASE WHEN b.booking_status = 'CONFIRMED' OR
              (b.booking_status = 'PENDING' AND b.expires_at > CURRENT_TIMESTAMP(3))
              THEN bs.seat_number END) AS bookedSeats
       FROM trips t JOIN routes r ON r.id = t.route_id
       JOIN vehicles v ON v.id = t.vehicle_id
       LEFT JOIN booking_seats bs ON bs.trip_id = t.id
       LEFT JOIN bookings b ON b.id = bs.booking_id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      GROUP BY t.id, t.route_id, t.vehicle_id, t.departure_time, t.price, t.status,
               r.origin, r.destination, r.estimated_duration, v.license_plate, v.seat_count
      ORDER BY t.departure_time DESC, t.id DESC LIMIT 500`, params,
  );
  return rows.map((row) => ({ ...row, tripId: id(row.tripId), routeId: id(row.routeId),
    vehicleId: id(row.vehicleId), price: row.price === null ? null : Number(row.price),
    totalSeats: Number(row.totalSeats), bookedSeats: Number(row.bookedSeats) }));
};

const assertSchedule = async (connection, input, excludeTripId = null) => {
  const [routes] = await connection.query(
    "SELECT id, status, estimated_duration AS duration FROM routes WHERE id = ?", [input.routeId],
  );
  if (!routes[0] || routes[0].status !== "ACTIVE" || Number(routes[0].duration) <= 0) {
    throw createHttpError(404, "ROUTE_NOT_ACTIVE", "Tuyến đường không hoạt động hoặc chưa có thời lượng");
  }
  const [vehicles] = await connection.query(
    "SELECT id, vehicle_status AS status FROM vehicles WHERE id = ? FOR UPDATE", [input.vehicleId],
  );
  if (!vehicles[0] || vehicles[0].status !== "ACTIVE") {
    throw createHttpError(404, "VEHICLE_NOT_ACTIVE", "Xe không hoạt động");
  }
  const [conflicts] = await connection.query(
    `SELECT t.id FROM trips t JOIN routes r ON r.id = t.route_id
      WHERE t.vehicle_id = ? AND t.status <> 'CANCELLED'
        AND t.id <> COALESCE(?, 0)
        AND t.departure_time < DATE_ADD(?, INTERVAL ? MINUTE)
        AND DATE_ADD(t.departure_time, INTERVAL r.estimated_duration MINUTE) > ?
      LIMIT 1`,
    [input.vehicleId, excludeTripId, input.departureTime, Number(routes[0].duration), input.departureTime],
  );
  if (conflicts[0]) throw createHttpError(409, "VEHICLE_SCHEDULE_CONFLICT", "Xe đã có chuyến trùng khung giờ");
};

const createTrip = async (body, database) => {
  const input = tripInput(body);
  return withTransaction(database, async (connection) => {
    await assertSchedule(connection, input);
    const [result] = await connection.query(
      "INSERT INTO trips (route_id, vehicle_id, departure_time, price, status) VALUES (?, ?, ?, ?, 'OPEN')",
      [input.routeId, input.vehicleId, input.departureTime, input.price],
    );
    return { tripId: id(result.insertId), status: "OPEN" };
  });
};

const updateTrip = async (tripId, body, database) => {
  const trip = positiveId(tripId, "tripId");
  const input = tripInput(body);
  return withTransaction(database, async (connection) => {
    const [rows] = await connection.query("SELECT id, status FROM trips WHERE id = ? FOR UPDATE", [trip]);
    if (!rows[0]) throw createHttpError(404, "TRIP_NOT_FOUND", "Chuyến xe không tồn tại");
    if (rows[0].status === "CANCELLED") throw createHttpError(409, "TRIP_CANCELLED", "Không thể sửa chuyến đã hủy");
    const [bookings] = await connection.query(
      `SELECT id FROM bookings WHERE trip_id = ? AND
       (booking_status = 'CONFIRMED' OR (booking_status = 'PENDING' AND expires_at > CURRENT_TIMESTAMP(3))) LIMIT 1`, [trip],
    );
    if (bookings[0]) throw createHttpError(409, "TRIP_HAS_BOOKINGS", "Chuyến đã có khách, không thể đổi lịch hoặc xe");
    await assertSchedule(connection, input, trip);
    await connection.query(
      "UPDATE trips SET route_id = ?, vehicle_id = ?, departure_time = ?, price = ? WHERE id = ?",
      [input.routeId, input.vehicleId, input.departureTime, input.price, trip],
    );
    return { tripId: trip, status: rows[0].status };
  });
};

const updateTripStatus = async (tripId, body, database) => {
  const trip = positiveId(tripId, "tripId");
  const status = String(body?.status || "").toUpperCase();
  if (!["OPEN", "CLOSED", "CANCELLED"].includes(status)) throw createHttpError(400, "VALIDATION_ERROR", "status không hợp lệ");
  return withTransaction(database, async (connection) => {
    const [rows] = await connection.query("SELECT id, status, departure_time AS departureTime FROM trips WHERE id = ? FOR UPDATE", [trip]);
    if (!rows[0]) throw createHttpError(404, "TRIP_NOT_FOUND", "Chuyến xe không tồn tại");
    if (rows[0].status === "CANCELLED") throw createHttpError(409, "TRIP_CANCELLED", "Chuyến đã hủy không thể mở lại");
    if (status === "OPEN" && new Date(rows[0].departureTime).getTime() <= Date.now()) {
      throw createHttpError(409, "TRIP_DEPARTED", "Không thể mở chuyến đã khởi hành");
    }
    if (status === "CANCELLED") {
      const [bookings] = await connection.query(
        `SELECT id FROM bookings WHERE trip_id = ? AND
         (booking_status = 'CONFIRMED' OR (booking_status = 'PENDING' AND expires_at > CURRENT_TIMESTAMP(3))) LIMIT 1`, [trip],
      );
      if (bookings[0]) throw createHttpError(409, "TRIP_HAS_BOOKINGS", "Chuyến đã có khách; cần xử lý đơn và hoàn tiền trước khi hủy");
    }
    await connection.query("UPDATE trips SET status = ? WHERE id = ?", [status, trip]);
    return { tripId: trip, status };
  });
};

const loginAdmin = async (body = {}, database) => {
  const identifier = String(body.identifier || body.email || body.phone || "").trim();
  const password = String(body.password || "");
  const clientRole = body.clientRole ? String(body.clientRole).trim().toUpperCase() : "ADMIN";

  if (!identifier || !password) {
    throw createHttpError(400, "VALIDATION_ERROR", "Vui lòng nhập đầy đủ tài khoản (email hoặc số điện thoại) và mật khẩu");
  }

  if (clientRole !== "ADMIN") {
    throw createHttpError(403, "AUTH_ROLE_MISMATCH", "Endpoint này chỉ dành cho tài khoản Admin");
  }

  const [rows] = await getDatabase(database).query(
    `SELECT id, full_name, email, phone, password_hash, role, status
       FROM users
      WHERE email = ? OR phone = ?
      LIMIT 1`,
    [identifier, identifier],
  );

  if (rows.length === 0) {
    throw createHttpError(401, "INVALID_CREDENTIALS", "Thông tin đăng nhập không chính xác");
  }

  const user = rows[0];

  if (String(user.role).toUpperCase() !== "ADMIN") {
    throw createHttpError(403, "AUTH_ROLE_MISMATCH", "Tài khoản không có quyền truy cập quản trị viên");
  }

  const statusUpper = String(user.status || "").toUpperCase();
  if (statusUpper !== "ACTIVE") {
    throw createHttpError(
      403,
      "ACCOUNT_INACTIVE",
      statusUpper === "SUSPENDED"
        ? "Tài khoản đã bị khóa vĩnh viễn. Vui lòng liên hệ hỗ trợ"
        : "Tài khoản Admin chưa được kích hoạt",
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw createHttpError(401, "INVALID_CREDENTIALS", "Mật khẩu không chính xác");
  }

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    status: user.status,
  });

  let refreshData = { refreshToken: null, familyId: null };
  try {
    refreshData = await issueRefreshToken(user.id);
  } catch (err) {
    // Không chặn đăng nhập nếu redis gặp lỗi refresh token
  }

  return {
    user: {
      id: String(user.id),
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
    tokens: {
      accessToken,
      refreshToken: refreshData.refreshToken,
      familyId: refreshData.familyId,
      expiresIn: 15 * 60,
    },
  };
};

const getAdminProfile = async (userId, database) => {
  const [rows] = await getDatabase(database).query(
    `SELECT id, full_name AS fullName, email, phone, role, status
       FROM users
      WHERE id = ? LIMIT 1`,
    [userId],
  );
  if (!rows[0]) {
    throw createHttpError(404, "USER_NOT_FOUND", "Không tìm thấy thông tin quản trị viên");
  }
  return {
    ...rows[0],
    id: String(rows[0].id),
  };
};

const getDashboardStats = async (database) => {
  const db = getDatabase(database);

  // Tổng doanh thu từ booking CONFIRMED
  const [revenueRows] = await db.query(
    "SELECT COALESCE(SUM(total_fare), 0) AS totalRevenue FROM bookings WHERE booking_status = 'CONFIRMED'"
  );
  const totalRevenue = Number(revenueRows[0].totalRevenue);

  // Tổng số chuyến OPEN
  const [openRows] = await db.query(
    "SELECT COUNT(*) AS cnt FROM trips WHERE status = 'OPEN'"
  );
  const activeTrips = Number(openRows[0].cnt);

  // Tổng ghế đã đặt (CONFIRMED hoặc PENDING chưa hết hạn)
  const [seatRows] = await db.query(
    `SELECT COUNT(bs.seat_number) AS cnt
       FROM booking_seats bs
       JOIN bookings b ON b.id = bs.booking_id
      WHERE b.booking_status = 'CONFIRMED'
         OR (b.booking_status = 'PENDING' AND b.expires_at > CURRENT_TIMESTAMP(3))`
  );
  const bookedSeats = Number(seatRows[0].cnt);

  // Tổng xe ACTIVE
  const [vehicleRows] = await db.query(
    "SELECT COUNT(*) AS cnt FROM vehicles WHERE vehicle_status = 'ACTIVE'"
  );
  const activeVehicles = Number(vehicleRows[0].cnt);

  // Tổng routes
  const [routeRows] = await db.query("SELECT COUNT(*) AS cnt FROM routes");
  const totalRoutes = Number(routeRows[0].cnt);

  // Tổng fares đang active
  const [fareRows] = await db.query("SELECT COUNT(*) AS cnt FROM fares WHERE is_active = 1");
  const totalFares = Number(fareRows[0].cnt);

  // Tổng trips
  const [tripRows] = await db.query("SELECT COUNT(*) AS cnt FROM trips");
  const totalTrips = Number(tripRows[0].cnt);

  // Tổng bookings
  const [bookingRows] = await db.query("SELECT COUNT(*) AS cnt FROM bookings");
  const totalBookings = Number(bookingRows[0].cnt);

  // Doanh thu theo tháng (năm hiện tại)
  const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
  const [monthlyRows] = await db.query(
    `SELECT MONTH(b.created_at) AS m, COALESCE(SUM(b.total_fare), 0) AS total
       FROM bookings b
      WHERE b.booking_status = 'CONFIRMED' AND YEAR(b.created_at) = YEAR(CURRENT_DATE)
      GROUP BY MONTH(b.created_at)
      ORDER BY m`
  );
  const monthlyMap = {};
  for (const row of monthlyRows) monthlyMap[row.m] = Number(row.total);
  const monthlyRevenue = monthNames.map((name, i) => ({
    name,
    total: monthlyMap[i + 1] || 0,
  }));

  // 5 booking gần nhất
  const [recentRows] = await db.query(
    `SELECT b.id AS bookingId, b.customer_name AS customerName, b.contact_phone AS contactPhone,
            b.total_fare AS totalFare, b.booking_status AS bookingStatus, b.seat_count AS seatCount,
            b.created_at AS createdAt,
            r.origin, r.destination
       FROM bookings b
       JOIN trips t ON t.id = b.trip_id
       JOIN routes r ON r.id = t.route_id
      ORDER BY b.created_at DESC
      LIMIT 5`
  );
  const recentBookings = recentRows.map((row) => ({
    ...row,
    totalFare: Number(row.totalFare),
    seatCount: Number(row.seatCount),
  }));

  return {
    totalRevenue,
    activeTrips,
    bookedSeats,
    activeVehicles,
    totalRoutes,
    totalFares,
    totalTrips,
    totalBookings,
    monthlyRevenue,
    recentBookings,
  };
};

const createRoute = async (body, database) => {
  const origin = String(body?.origin || "").trim();
  const destination = String(body?.destination || "").trim();
  const distance = Number(body?.distance);
  const estimatedDuration = Number(body?.estimatedDuration || 120);

  if (!origin || !destination) {
    throw createHttpError(400, "VALIDATION_ERROR", "Điểm đi và điểm đến không được để trống");
  }
  if (!Number.isFinite(distance) || distance <= 0) {
    throw createHttpError(400, "VALIDATION_ERROR", "Khoảng cách phải lớn hơn 0");
  }
  if (!Number.isFinite(estimatedDuration) || estimatedDuration <= 0) {
    throw createHttpError(400, "VALIDATION_ERROR", "Thời gian ước tính phải lớn hơn 0");
  }

  const [result] = await getDatabase(database).query(
    "INSERT INTO routes (origin, destination, distance, estimated_duration, status) VALUES (?, ?, ?, ?, 'ACTIVE')",
    [origin, destination, distance, estimatedDuration],
  );

  return {
    routeId: id(result.insertId),
    origin,
    destination,
    distance,
    estimatedDuration,
    status: "ACTIVE",
  };
};

const updateRoute = async (routeId, body, database) => {
  const rId = positiveId(routeId, "routeId");
  const origin = String(body?.origin || "").trim();
  const destination = String(body?.destination || "").trim();
  const distance = Number(body?.distance);
  const estimatedDuration = body?.estimatedDuration ? Number(body.estimatedDuration) : null;

  if (!origin || !destination) {
    throw createHttpError(400, "VALIDATION_ERROR", "Điểm đi và điểm đến không được để trống");
  }
  if (!Number.isFinite(distance) || distance <= 0) {
    throw createHttpError(400, "VALIDATION_ERROR", "Khoảng cách phải lớn hơn 0");
  }

  const db = getDatabase(database);
  const [existing] = await db.query("SELECT id FROM routes WHERE id = ?", [rId]);
  if (!existing[0]) throw createHttpError(404, "ROUTE_NOT_FOUND", "Tuyến đường không tồn tại");

  if (estimatedDuration && estimatedDuration > 0) {
    await db.query(
      "UPDATE routes SET origin = ?, destination = ?, distance = ?, estimated_duration = ? WHERE id = ?",
      [origin, destination, distance, estimatedDuration, rId],
    );
  } else {
    await db.query(
      "UPDATE routes SET origin = ?, destination = ?, distance = ? WHERE id = ?",
      [origin, destination, distance, rId],
    );
  }

  return { routeId: rId, origin, destination, distance };
};

const deleteRoute = async (routeId, database) => {
  const rId = positiveId(routeId, "routeId");
  const db = getDatabase(database);
  const [result] = await db.query("UPDATE routes SET status = 'INACTIVE' WHERE id = ?", [rId]);
  if (!result.affectedRows) throw createHttpError(404, "ROUTE_NOT_FOUND", "Tuyến đường không tồn tại");
  return { routeId: rId };
};

const listStops = async (query = {}, database) => {
  const params = [];
  const conditions = [];
  if (query.routeId) {
    conditions.push("s.route_id = ?");
    params.push(positiveId(query.routeId, "routeId"));
  }
  const [rows] = await getDatabase(database).query(
    `SELECT s.id AS stopId, s.route_id AS routeId, s.stop_name AS stopName,
            s.address, s.type, s.stop_order AS stopOrder, s.status,
            r.origin, r.destination
       FROM stops s
       JOIN routes r ON r.id = s.route_id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY s.route_id, s.stop_order ASC, s.id ASC`,
    params,
  );
  return rows.map((r) => ({
    ...r,
    stopId: id(r.stopId),
    routeId: id(r.routeId),
    stopOrder: Number(r.stopOrder || 1),
  }));
};

const createStop = async (body, database) => {
  const routeId = positiveId(body?.routeId, "routeId");
  const stopName = String(body?.stopName || "").trim();
  const address = String(body?.address || "").trim();
  const type = String(body?.type || "BOTH").toUpperCase();

  if (!stopName) throw createHttpError(400, "VALIDATION_ERROR", "Tên điểm dừng không được để trống");
  if (!address) throw createHttpError(400, "VALIDATION_ERROR", "Địa chỉ không được để trống");
  if (!["PICKUP", "DROPOFF", "BOTH"].includes(type)) {
    throw createHttpError(400, "VALIDATION_ERROR", "Loại điểm dừng phải là PICKUP, DROPOFF hoặc BOTH");
  }

  const db = getDatabase(database);
  const [route] = await db.query("SELECT id FROM routes WHERE id = ?", [routeId]);
  if (!route[0]) throw createHttpError(404, "ROUTE_NOT_FOUND", "Tuyến đường không tồn tại");

  const [maxOrder] = await db.query(
    "SELECT COALESCE(MAX(stop_order), 0) AS maxOrder FROM stops WHERE route_id = ?",
    [routeId],
  );
  const stopOrder = (maxOrder[0]?.maxOrder || 0) + 1;

  const [result] = await db.query(
    "INSERT INTO stops (route_id, stop_name, address, type, stop_order, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')",
    [routeId, stopName, address, type, stopOrder],
  );

  return {
    stopId: id(result.insertId),
    routeId,
    stopName,
    address,
    type,
    stopOrder,
    status: "ACTIVE",
  };
};

const deleteStop = async (stopId, database) => {
  const sId = positiveId(stopId, "stopId");
  const [result] = await getDatabase(database).query("DELETE FROM stops WHERE id = ?", [sId]);
  if (!result.affectedRows) throw createHttpError(404, "STOP_NOT_FOUND", "Điểm dừng không tồn tại");
  return { stopId: sId };
};

const createVehicle = async (body, database) => {
  const licensePlate = String(body?.licensePlate || "").trim();
  const totalSeats = Number(body?.totalSeats || body?.seatCount || 4);
  const vehicleTypeRaw = body?.vehicleType || body?.vehicleTypeId;

  if (!licensePlate) {
    throw createHttpError(400, "VALIDATION_ERROR", "Biển số xe không được để trống");
  }
  if (!Number.isFinite(totalSeats) || totalSeats < 1) {
    throw createHttpError(400, "VALIDATION_ERROR", "Số lượng ghế phải lớn hơn 0");
  }

  const db = getDatabase(database);
  let vehicleTypeId = null;
  if (vehicleTypeRaw) {
    if (/^\d+$/.test(String(vehicleTypeRaw))) {
      const [vType] = await db.query("SELECT id FROM vehicle_types WHERE id = ?", [vehicleTypeRaw]);
      if (vType[0]) vehicleTypeId = vType[0].id;
    } else {
      const typeName = String(vehicleTypeRaw).trim();
      const [vType] = await db.query("SELECT id FROM vehicle_types WHERE type_name = ?", [typeName]);
      if (vType[0]) {
        vehicleTypeId = vType[0].id;
      } else {
        const [insertResult] = await db.query("INSERT INTO vehicle_types (type_name) VALUES (?)", [typeName]);
        vehicleTypeId = insertResult.insertId;
      }
    }
  }

  const [result] = await db.query(
    "INSERT INTO vehicles (license_plate, seat_count, vehicle_status, vehicle_type_id) VALUES (?, ?, 'ACTIVE', ?)",
    [licensePlate, totalSeats, vehicleTypeId],
  );

  return {
    vehicleId: id(result.insertId),
    licensePlate,
    totalSeats,
    seatCount: totalSeats,
    status: "ACTIVE",
    vehicleTypeId: id(vehicleTypeId),
  };
};

const createBookingType = async (body, database) => {
  const typeName = String(body?.typeName || "").trim();
  const description = String(body?.description || "").trim() || null;

  if (!typeName) {
    throw createHttpError(400, "VALIDATION_ERROR", "Tên hình thức đặt xe không được để trống");
  }

  const [result] = await getDatabase(database).query(
    "INSERT INTO booking_types (type_name, description, is_active) VALUES (?, ?, 1)",
    [typeName, description],
  );

  return {
    bookingTypeId: id(result.insertId),
    typeName,
    description,
    isActive: true,
  };
};

const listBookings = async (query = {}, database) => {
  const params = [];
  const conditions = [];

  if (query.status) {
    conditions.push("b.booking_status = ?");
    params.push(query.status);
  }
  if (query.tripId) {
    conditions.push("b.trip_id = ?");
    params.push(positiveId(query.tripId, "tripId"));
  }

  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 500);
  const page = Math.max(Number(query.page) || 1, 1);
  const offset = (page - 1) * limit;

  const [rows] = await getDatabase(database).query(
    `SELECT b.id AS bookingId, b.customer_name AS customerName,
            b.contact_phone AS contactPhone, b.total_fare AS totalFare,
            b.booking_status AS status, b.payment_status AS paymentStatus,
            b.seat_count AS seatCount, b.created_at AS createdAt,
            t.id AS tripId, t.departure_time AS departureTime,
            r.origin, r.destination,
            GROUP_CONCAT(bs.seat_number ORDER BY bs.seat_number ASC SEPARATOR ', ') AS seatsList
       FROM bookings b
       JOIN trips t ON t.id = b.trip_id
       JOIN routes r ON r.id = t.route_id
       LEFT JOIN booking_seats bs ON bs.booking_id = b.id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      GROUP BY b.id, b.customer_name, b.contact_phone, b.total_fare,
               b.booking_status, b.payment_status, b.seat_count, b.created_at,
               t.id, t.departure_time, r.origin, r.destination
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return rows.map((r) => ({
    bookingId: r.bookingId,
    customerName: r.customerName || "Khách vãng lai",
    tripInfo: `${r.origin} - ${r.destination} (${new Date(r.departureTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })})`,
    seats: r.seatsList ? r.seatsList.split(", ") : [],
    totalFare: Number(r.totalFare),
    status: r.status,
    paymentStatus: r.paymentStatus,
    contactPhone: r.contactPhone,
    createdAt: r.createdAt,
    tripId: id(r.tripId),
  }));
};

const getBookingDetail = async (bookingId, database) => {
  const bId = String(bookingId || "").trim();
  const db = getDatabase(database);

  const [rows] = await db.query(
    `SELECT b.id AS bookingId, b.customer_id AS customerId, b.customer_name AS customerName,
            b.contact_phone AS contactPhone, b.driver_note AS driverNote,
            b.pickup_address AS pickupAddress, b.dropoff_address AS dropoffAddress,
            b.seat_count AS seatCount, b.fare_per_seat AS farePerSeat, b.total_fare AS totalFare,
            b.booking_status AS bookingStatus, b.payment_status AS paymentStatus,
            b.expires_at AS expiresAt, b.created_at AS createdAt,
            t.id AS tripId, t.departure_time AS departureTime, t.price AS tripPrice,
            r.origin, r.destination, r.distance, r.estimated_duration AS estimatedDuration,
            v.license_plate AS licensePlate, vt.type_name AS vehicleTypeName,
            bt.type_name AS bookingTypeName
       FROM bookings b
       JOIN trips t ON t.id = b.trip_id
       JOIN routes r ON r.id = t.route_id
       JOIN vehicles v ON v.id = t.vehicle_id
       LEFT JOIN vehicle_types vt ON vt.id = v.vehicle_type_id
       LEFT JOIN booking_types bt ON bt.id = b.booking_type_id
      WHERE b.id = ?
      LIMIT 1`,
    [bId],
  );

  if (!rows[0]) {
    throw createHttpError(404, "BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt chuyến");
  }

  const b = rows[0];

  const [seatRows] = await db.query(
    "SELECT seat_number FROM booking_seats WHERE booking_id = ? ORDER BY seat_number ASC",
    [bId],
  );
  const seats = seatRows.map((s) => s.seat_number);

  const [paymentRows] = await db.query(
    "SELECT id AS transactionId, amount, payment_method AS paymentMethod, status, paid_at AS paidAt, created_at AS createdAt FROM payments WHERE booking_id = ? ORDER BY created_at DESC",
    [bId],
  );

  return {
    bookingId: b.bookingId,
    customerDetails: {
      customerId: b.customerId,
      name: b.customerName,
      customerName: b.customerName,
      phone: b.contactPhone,
      contactPhone: b.contactPhone,
      driverNote: b.driverNote,
      pickupAddress: b.pickupAddress,
      dropoffAddress: b.dropoffAddress,
      bookingTypeName: b.bookingTypeName,
      createdAt: b.createdAt,
    },
    tripDetails: {
      tripId: id(b.tripId),
      origin: b.origin,
      destination: b.destination,
      departureTime: b.departureTime,
      distance: Number(b.distance),
      estimatedDuration: Number(b.estimatedDuration),
      licensePlate: b.licensePlate,
      vehicleTypeName: b.vehicleTypeName,
      seats,
      seatCount: Number(b.seatCount),
      farePerSeat: Number(b.farePerSeat),
    },
    paymentDetails: {
      totalFare: Number(b.totalFare),
      bookingStatus: b.bookingStatus,
      paymentStatus: b.paymentStatus,
      paymentMethod: paymentRows[0]?.paymentMethod || "VNPAY",
      paidAt: paymentRows[0]?.paidAt || (b.paymentStatus === "PAID" ? b.createdAt : null),
      transactions: paymentRows.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    },
  };
};

const listPayments = async (query = {}, database) => {
  const params = [];
  const conditions = [];

  if (query.status) {
    conditions.push("p.status = ?");
    params.push(query.status);
  }
  if (query.fromDate) {
    conditions.push("p.created_at >= ?");
    params.push(query.fromDate);
  }
  if (query.toDate) {
    conditions.push("p.created_at <= ?");
    params.push(query.toDate);
  }

  const [rows] = await getDatabase(database).query(
    `SELECT p.id AS transactionId, p.booking_id AS bookingId,
            p.amount, p.payment_method AS paymentMethod, p.status,
            p.paid_at AS paidAt, p.created_at AS createdAt,
            b.customer_name AS customerName, b.contact_phone AS contactPhone,
            r.origin, r.destination
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       JOIN trips t ON t.id = b.trip_id
       JOIN routes r ON r.id = t.route_id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY p.created_at DESC
      LIMIT 500`,
    params,
  );

  return rows.map((row) => ({
    transactionId: row.transactionId,
    bookingId: row.bookingId,
    amount: Number(row.amount),
    paymentMethod: row.paymentMethod,
    paidAt: row.paidAt || row.createdAt,
    status: row.status,
    customerName: row.customerName,
    contactPhone: row.contactPhone,
    route: `${row.origin} - ${row.destination}`,
  }));
};

const requestCancellation = async (body, database) => {
  const bookingId = String(body?.bookingId || "").trim();
  const requestedBy = String(body?.requestedBy || "CUSTOMER").trim();
  const reason = String(body?.reason || "").trim();

  if (!bookingId) throw createHttpError(400, "VALIDATION_ERROR", "bookingId không được để trống");
  if (!reason) throw createHttpError(400, "VALIDATION_ERROR", "Lý do hủy không được để trống");

  const db = getDatabase(database);
  const [bRows] = await db.query("SELECT id, booking_status FROM bookings WHERE id = ?", [bookingId]);
  if (!bRows[0]) throw createHttpError(404, "BOOKING_NOT_FOUND", "Đơn đặt không tồn tại");

  const [result] = await db.query(
    "INSERT INTO cancellation_requests (booking_id, requested_by, reason, status) VALUES (?, ?, ?, 'PENDING')",
    [bookingId, requestedBy, reason],
  );

  return {
    requestId: id(result.insertId),
    status: "PENDING",
  };
};

const approveCancellation = async (cancellationId, body, database) => {
  const cId = positiveId(cancellationId, "cancellationId");
  const adminId = body?.adminId ? String(body.adminId) : "ADMIN";
  const reasonNote = String(body?.reasonNote || "").trim();
  const applyCommissionPenalty = Boolean(body?.applyCommissionPenalty);

  return withTransaction(database, async (connection) => {
    const [cRows] = await connection.query(
      "SELECT id, booking_id AS bookingId, status FROM cancellation_requests WHERE id = ? FOR UPDATE",
      [cId],
    );
    if (!cRows[0]) throw createHttpError(404, "CANCELLATION_NOT_FOUND", "Yêu cầu hủy không tồn tại");
    if (cRows[0].status === "APPROVED") {
      throw createHttpError(409, "ALREADY_APPROVED", "Yêu cầu hủy đã được duyệt trước đó");
    }

    const [bRows] = await connection.query(
      "SELECT id, total_fare AS totalFare, booking_status FROM bookings WHERE id = ? FOR UPDATE",
      [cRows[0].bookingId],
    );
    if (!bRows[0]) throw createHttpError(404, "BOOKING_NOT_FOUND", "Đơn đặt xe không tồn tại");

    let penaltyAmount = 0;
    if (applyCommissionPenalty) {
      penaltyAmount = Math.round(Number(bRows[0].totalFare) * 0.1);
    }

    await connection.query(
      `UPDATE cancellation_requests
          SET status = 'APPROVED', admin_id = ?, reason_note = ?,
              apply_commission_penalty = ?, penalty_amount = ?
        WHERE id = ?`,
      [adminId, reasonNote, applyCommissionPenalty ? 1 : 0, penaltyAmount, cId],
    );

    await connection.query(
      "UPDATE bookings SET booking_status = 'CANCELLED' WHERE id = ?",
      [cRows[0].bookingId],
    );

    return {
      cancellationId: cId,
      penaltyAmount,
      status: "APPROVED",
    };
  });
};

const listCancellations = async (query = {}, database) => {
  const params = [];
  const conditions = [];

  if (query.status) {
    conditions.push("c.status = ?");
    params.push(query.status);
  }
  if (query.bookingId) {
    conditions.push("c.booking_id = ?");
    params.push(query.bookingId);
  }

  const [rows] = await getDatabase(database).query(
    `SELECT c.id AS cancellationId, c.booking_id AS bookingId,
            c.requested_by AS requestedBy, c.reason, c.status,
            c.admin_id AS adminId, c.reason_note AS reasonNote,
            c.apply_commission_penalty AS applyCommissionPenalty,
            c.penalty_amount AS penaltyAmount, c.created_at AS createdAt,
            b.customer_name AS customerName, b.contact_phone AS contactPhone,
            b.total_fare AS totalFare, b.payment_status AS paymentStatus,
            r.origin, r.destination, t.departure_time AS departureTime
       FROM cancellation_requests c
       JOIN bookings b ON b.id = c.booking_id
       JOIN trips t ON t.id = b.trip_id
       JOIN routes r ON r.id = t.route_id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY c.created_at DESC`,
    params,
  );

  return rows.map((r) => ({
    ...r,
    cancellationId: id(r.cancellationId),
    applyCommissionPenalty: Boolean(r.applyCommissionPenalty),
    penaltyAmount: Number(r.penaltyAmount),
    totalFare: Number(r.totalFare),
  }));
};

const processRefund = async (body, database) => {
  const bookingId = String(body?.bookingId || "").trim();
  const cancellationId = body?.cancellationId ? positiveId(body.cancellationId, "cancellationId") : null;
  const refundPercentage = body?.refundPercentage !== undefined ? Number(body.refundPercentage) : 100;

  if (!bookingId) throw createHttpError(400, "VALIDATION_ERROR", "bookingId không được để trống");
  if (!Number.isFinite(refundPercentage) || refundPercentage < 0 || refundPercentage > 100) {
    throw createHttpError(400, "VALIDATION_ERROR", "Tỷ lệ hoàn tiền phải từ 0 đến 100%");
  }

  return withTransaction(database, async (connection) => {
    const [bRows] = await connection.query(
      "SELECT id, total_fare AS totalFare, payment_status AS paymentStatus FROM bookings WHERE id = ? FOR UPDATE",
      [bookingId],
    );
    if (!bRows[0]) throw createHttpError(404, "BOOKING_NOT_FOUND", "Đơn đặt không tồn tại");

    let penaltyAmount = 0;
    if (cancellationId) {
      const [cRows] = await connection.query(
        "SELECT penalty_amount AS penaltyAmount FROM cancellation_requests WHERE id = ?",
        [cancellationId],
      );
      if (cRows[0]) penaltyAmount = Number(cRows[0].penaltyAmount || 0);
    }

    const rawRefund = Number(bRows[0].totalFare) * (refundPercentage / 100);
    const finalRefundAmount = Math.max(0, Math.round(rawRefund - penaltyAmount));

    const [result] = await connection.query(
      `INSERT INTO refunds (booking_id, cancellation_id, refund_percentage, final_refund_amount, status)
       VALUES (?, ?, ?, ?, 'REFUNDED')`,
      [bookingId, cancellationId, refundPercentage, finalRefundAmount],
    );

    await connection.query(
      "UPDATE bookings SET payment_status = 'REFUNDED' WHERE id = ?",
      [bookingId],
    );

    return {
      refundId: id(result.insertId),
      finalRefundAmount,
      status: "REFUNDED",
    };
  });
};

const listRefunds = async (query = {}, database) => {
  const [rows] = await getDatabase(database).query(
    `SELECT rf.id AS refundId, rf.booking_id AS bookingId, rf.cancellation_id AS cancellationId,
            rf.refund_percentage AS refundPercentage, rf.final_refund_amount AS finalRefundAmount,
            rf.status, rf.created_at AS createdAt,
            b.customer_name AS customerName, b.contact_phone AS contactPhone, b.total_fare AS totalFare,
            r.origin, r.destination
       FROM refunds rf
       JOIN bookings b ON b.id = rf.booking_id
       JOIN trips t ON t.id = b.trip_id
       JOIN routes r ON r.id = t.route_id
      ORDER BY rf.created_at DESC`,
  );
  return rows.map((r) => ({
    ...r,
    refundId: id(r.refundId),
    cancellationId: id(r.cancellationId),
    refundPercentage: Number(r.refundPercentage),
    finalRefundAmount: Number(r.finalRefundAmount),
    totalFare: Number(r.totalFare),
  }));
};

module.exports = {
  listRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  listStops,
  createStop,
  deleteStop,
  listVehicles,
  createVehicle,
  listBookingTypes,
  createBookingType,
  listVehicleTypes,
  createVehicleType,
  assignVehicleType,
  listFares,
  createFare,
  updateFare,
  deleteFare,
  listTrips,
  createTrip,
  updateTrip,
  updateTripStatus,
  listBookings,
  getBookingDetail,
  listPayments,
  requestCancellation,
  approveCancellation,
  listCancellations,
  processRefund,
  listRefunds,
  loginAdmin,
  getAdminProfile,
  getDashboardStats,
};
