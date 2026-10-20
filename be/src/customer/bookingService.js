const {
  calculateTotalFare,
  createHttpError,
  randomUUID,
  validateBookingInput,
} = require("./bookingValidation");

const HOLD_MINUTES = 15;

const assertCustomerCanBook = async (connection, customerId) => {
  const [rows] = await connection.query(
    "SELECT id, role, status FROM users WHERE id = ? LIMIT 1",
    [customerId],
  );
  const customer = rows[0];
  if (!customer) {
    throw createHttpError(404, "CUSTOMER_NOT_FOUND", "Khách hàng không tồn tại");
  }
  if (String(customer.role).toUpperCase() !== "CUSTOMER") {
    throw createHttpError(403, "CUSTOMER_ROLE_REQUIRED", "Tài khoản không phải khách hàng");
  }
  if (String(customer.status).toUpperCase() !== "ACTIVE") {
    throw createHttpError(403, "CUSTOMER_INACTIVE", "Tài khoản khách hàng chưa hoạt động");
  }
};

const loadAndLockTrip = async (connection, tripId) => {
  const [rows] = await connection.query(
    `SELECT t.id, t.route_id, t.vehicle_id, t.departure_time,
            t.price, t.status, v.seat_count, v.vehicle_type_id,
            v.vehicle_status AS vehicle_status, r.status AS route_status
       FROM trips t
       JOIN vehicles v ON v.id = t.vehicle_id
       JOIN routes r ON r.id = t.route_id
      WHERE t.id = ?
      LIMIT 1
      FOR UPDATE`,
    [tripId],
  );
  const trip = rows[0];
  if (!trip) {
    throw createHttpError(404, "TRIP_NOT_FOUND", "Chuyến xe không tồn tại");
  }
  if (!["OPEN", "ACTIVE"].includes(String(trip.status).toUpperCase())) {
    throw createHttpError(409, "TRIP_NOT_OPEN", "Chuyến xe hiện không nhận đặt chỗ");
  }
  if (String(trip.route_status).toUpperCase() !== "ACTIVE" ||
    String(trip.vehicle_status).toUpperCase() !== "ACTIVE") {
    throw createHttpError(409, "TRIP_NOT_OPEN", "Tuyến hoặc xe hiện không nhận đặt chỗ");
  }
  if (new Date(trip.departure_time).getTime() <= Date.now()) {
    throw createHttpError(409, "TRIP_DEPARTED", "Chuyến xe đã khởi hành");
  }
  return trip;
};

const assertSeatsWithinCapacity = (seatNumbers, seatCount) => {
  const capacity = Number(seatCount);
  const invalidSeats = seatNumbers.filter((seat) => {
    const seatNumber = Number(seat);
    return !Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > capacity;
  });
  if (invalidSeats.length > 0) {
    throw createHttpError(
      400,
      "SEAT_OUT_OF_RANGE",
      `Ghế không hợp lệ: ${invalidSeats.join(", ")}. Xe chỉ có ${capacity} ghế`,
    );
  }
};

const assertStopsAreValid = async (
  connection,
  routeId,
  pickupPointId,
  dropoffPointId,
) => {
  if (pickupPointId === dropoffPointId) {
    throw createHttpError(400, "INVALID_STOP_ORDER", "Điểm đón và điểm trả phải khác nhau");
  }

  const [rows] = await connection.query(
    `SELECT id, route_id, type, stop_order, status
       FROM stops
      WHERE id IN (?, ?)`,
    [pickupPointId, dropoffPointId],
  );
  const byId = new Map(rows.map((row) => [String(row.id), row]));
  const pickup = byId.get(String(pickupPointId));
  const dropoff = byId.get(String(dropoffPointId));

  if (!pickup || !dropoff) {
    throw createHttpError(404, "STOP_NOT_FOUND", "Điểm đón hoặc điểm trả không tồn tại");
  }
  if (String(pickup.route_id) !== String(routeId) || String(dropoff.route_id) !== String(routeId)) {
    throw createHttpError(
      400,
      "STOP_ROUTE_MISMATCH",
      "Điểm đón và điểm trả phải thuộc tuyến của chuyến xe",
    );
  }
  if (
    String(pickup.status).toUpperCase() !== "ACTIVE" ||
    String(dropoff.status).toUpperCase() !== "ACTIVE"
  ) {
    throw createHttpError(409, "STOP_INACTIVE", "Điểm đón hoặc điểm trả đang ngừng hoạt động");
  }
  if (!["PICKUP", "BOTH"].includes(String(pickup.type).toUpperCase())) {
    throw createHttpError(400, "INVALID_PICKUP_POINT", "Điểm đã chọn không hỗ trợ đón khách");
  }
  if (!["DROPOFF", "BOTH"].includes(String(dropoff.type).toUpperCase())) {
    throw createHttpError(400, "INVALID_DROPOFF_POINT", "Điểm đã chọn không hỗ trợ trả khách");
  }
  if (Number(pickup.stop_order) >= Number(dropoff.stop_order)) {
    throw createHttpError(
      400,
      "INVALID_STOP_ORDER",
      "Điểm trả phải nằm sau điểm đón trên tuyến",
    );
  }
};

const loadBookingType = async (connection, bookingTypeId) => {
  const [rows] = await connection.query(
    "SELECT id FROM booking_types WHERE id = ? AND is_active = 1 LIMIT 1",
    [bookingTypeId],
  );
  if (!rows[0]) {
    throw createHttpError(
      404,
      "BOOKING_TYPE_NOT_FOUND",
      "Hình thức đặt xe không tồn tại hoặc đã ngừng áp dụng",
    );
  }
};

const resolveFarePerSeat = async (connection, trip, bookingTypeId) => {
  const [rows] = await connection.query(
    `SELECT base_price
       FROM fares
      WHERE route_id = ? AND booking_type_id = ? AND is_active = 1
        AND (vehicle_type_id = ? OR vehicle_type_id IS NULL)
      ORDER BY (vehicle_type_id IS NOT NULL) DESC, id DESC
      LIMIT 1`,
    [trip.route_id, bookingTypeId, trip.vehicle_type_id],
  );
  const configuredFare = rows[0]?.base_price;
  return configuredFare === undefined || configuredFare === null
    ? trip.price
    : configuredFare;
};

const releaseExpiredHolds = async (connection, tripId) => {
  await connection.query(
    `DELETE bs
       FROM booking_seats bs
       JOIN bookings b ON b.id = bs.booking_id
      WHERE b.trip_id = ?
        AND b.payment_status = 'PENDING'
        AND b.expires_at <= CURRENT_TIMESTAMP(3)`,
    [tripId],
  );
  await connection.query(
    `UPDATE bookings
        SET booking_status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP(3)
      WHERE trip_id = ?
        AND payment_status = 'PENDING'
        AND expires_at <= CURRENT_TIMESTAMP(3)`,
    [tripId],
  );
};

const assertSeatsAreAvailable = async (connection, tripId, seatNumbers) => {
  const placeholders = seatNumbers.map(() => "?").join(", ");
  const [rows] = await connection.query(
    `SELECT seat_number
       FROM booking_seats
      WHERE trip_id = ? AND seat_number IN (${placeholders})
      FOR UPDATE`,
    [tripId, ...seatNumbers],
  );
  if (rows.length > 0) {
    throw createHttpError(
      409,
      "SEAT_UNAVAILABLE",
      `Ghế đã được giữ hoặc đặt: ${rows.map((row) => row.seat_number).join(", ")}`,
    );
  }
};

const createBooking = async (rawInput, authenticatedUserId, database) => {
  const input = validateBookingInput(rawInput);
  if (authenticatedUserId && String(authenticatedUserId) !== input.customerId) {
    throw createHttpError(
      403,
      "CUSTOMER_ID_MISMATCH",
      "customerId không khớp với tài khoản đang đăng nhập",
    );
  }

  const activeDatabase = database || require("../database");
  const connection = await activeDatabase.getConnection();
  let transactionOpen = false;
  try {
    await connection.beginTransaction();
    transactionOpen = true;
    await assertCustomerCanBook(connection, input.customerId);
    const trip = await loadAndLockTrip(connection, input.tripId);
    assertSeatsWithinCapacity(input.seatNumbers, trip.seat_count);
    await assertStopsAreValid(
      connection,
      trip.route_id,
      input.pickupPointId,
      input.dropoffPointId,
    );
    await loadBookingType(connection, input.bookingTypeId);
    await releaseExpiredHolds(connection, input.tripId);
    await assertSeatsAreAvailable(connection, input.tripId, input.seatNumbers);

    const farePerSeat = await resolveFarePerSeat(connection, trip, input.bookingTypeId);
    const totalFare = calculateTotalFare(farePerSeat, input.seatNumbers.length);
    const bookingId = randomUUID();

    await connection.query(
      `INSERT INTO bookings (
         id, customer_id, trip_id, pickup_point_id, dropoff_point_id,
         booking_type_id, seat_count, fare_per_seat, total_fare,
         customer_name, contact_phone, driver_note, pickup_address, dropoff_address,
         booking_status, payment_status, expires_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING',
                 DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL ? MINUTE))`,
      [
        bookingId,
        input.customerId,
        input.tripId,
        input.pickupPointId,
        input.dropoffPointId,
        input.bookingTypeId,
        input.seatNumbers.length,
        farePerSeat,
        totalFare,
        input.customerName,
        input.contactPhone,
        input.driverNote,
        input.pickupAddress,
        input.dropoffAddress,
        HOLD_MINUTES,
      ],
    );

    const seatValues = input.seatNumbers.map(() => "(?, ?, ?)").join(", ");
    const seatParams = input.seatNumbers.flatMap((seatNumber) => [
      bookingId,
      input.tripId,
      seatNumber,
    ]);
    await connection.query(
      `INSERT INTO booking_seats (booking_id, trip_id, seat_number) VALUES ${seatValues}`,
      seatParams,
    );

    await connection.commit();
    transactionOpen = false;
    return { bookingId, totalFare, paymentStatus: "PENDING" };
  } catch (error) {
    if (transactionOpen) await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      throw createHttpError(409, "SEAT_UNAVAILABLE", "Một hoặc nhiều ghế vừa được người khác đặt");
    }
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { HOLD_MINUTES, createBooking };
