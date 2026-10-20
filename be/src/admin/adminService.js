const { createHttpError } = require("../customer/bookingValidation");
const { positiveId, priceValue, fareInput, tripInput } = require("./adminValidation");
const { vietnamDayBounds } = require("../utils/vietnamTime");

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

module.exports = { listRoutes, listVehicles, listBookingTypes, listVehicleTypes,
  createVehicleType, assignVehicleType, listFares, createFare, updateFare, deleteFare,
  listTrips, createTrip, updateTrip, updateTripStatus };
