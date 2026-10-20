const { createHttpError } = require("./bookingValidation");
const { vietnamDayBounds } = require("../utils/vietnamTime");

const getDatabase = (database) => database || require("../database");

const listRoutes = async (query = {}, database) => {
  const from = String(query.from || "").trim();
  const to = String(query.to || "").trim();
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

  const [rows] = await getDatabase(database).query(
    `SELECT id AS routeId, origin, destination, distance
       FROM routes
      WHERE ${conditions.join(" AND ")}
      ORDER BY origin, destination, id`,
    params,
  );
  return rows.map((row) => ({ ...row, routeId: String(row.routeId) }));
};

const listBookingTypes = async (database) => {
  const [rows] = await getDatabase(database).query(
    `SELECT id AS bookingTypeId, type_name AS typeName, description
       FROM booking_types
      WHERE is_active = 1
      ORDER BY id`,
  );
  return rows.map((row) => ({ ...row, bookingTypeId: String(row.bookingTypeId) }));
};

const listTrips = async (query = {}, database) => {
  const routeId = String(query.routeId || "").trim();
  const date = String(query.date || "").trim();
  const seats = Number(query.seats ?? 1);
  if (!routeId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(seats) || seats < 1) {
    throw createHttpError(400, "VALIDATION_ERROR", "routeId, date và seats phải hợp lệ");
  }
  const [dayStart, dayEnd] = vietnamDayBounds(date);

  const [rows] = await getDatabase(database).query(
    `SELECT t.id AS tripId, t.departure_time AS departureTime,
            t.price, r.origin, r.destination, v.seat_count AS totalSeats,
            v.license_plate AS vehicleName,
            v.seat_count - COUNT(b.id) AS availableSeats
       FROM trips t
       JOIN routes r ON r.id = t.route_id
       JOIN vehicles v ON v.id = t.vehicle_id
       LEFT JOIN booking_seats bs ON bs.trip_id = t.id
       LEFT JOIN bookings b ON b.id = bs.booking_id
         AND (b.booking_status = 'CONFIRMED'
           OR (b.booking_status = 'PENDING' AND b.expires_at > CURRENT_TIMESTAMP(3)))
      WHERE t.route_id = ? AND t.departure_time >= ? AND t.departure_time < ?
        AND t.departure_time > CURRENT_TIMESTAMP(3)
        AND t.status = 'OPEN' AND r.status = 'ACTIVE'
        AND v.vehicle_status = 'ACTIVE'
      GROUP BY t.id, t.departure_time, t.price, r.origin, r.destination,
               v.seat_count, v.license_plate
      HAVING availableSeats >= ?
      ORDER BY t.departure_time, t.id`,
    [routeId, dayStart, dayEnd, seats],
  );
  return rows.map((row) => ({
    tripId: String(row.tripId),
    routeName: `${row.origin} → ${row.destination}`,
    departureTime: row.departureTime,
    vehicleType: row.vehicleName,
    price: row.price === null ? null : Number(row.price),
    totalSeats: Number(row.totalSeats),
    availableSeats: Number(row.availableSeats),
  }));
};

const getTripDetail = async (tripId, database) => {
  const [rows] = await getDatabase(database).query(
    `SELECT t.id AS tripId, t.route_id AS routeId,
            t.departure_time AS departureTime, t.price,
            t.status, r.origin, r.destination,
            v.license_plate AS vehicleName, v.seat_count AS totalSeats
       FROM trips t
       JOIN routes r ON r.id = t.route_id
       JOIN vehicles v ON v.id = t.vehicle_id
      WHERE t.id = ?
      LIMIT 1`,
    [tripId],
  );
  const trip = rows[0];
  if (!trip) throw createHttpError(404, "TRIP_NOT_FOUND", "Chuyến xe không tồn tại");

  const [stops] = await getDatabase(database).query(
    `SELECT id AS stopId, stop_name AS stopName, address, type, stop_order AS stopOrder
       FROM stops
      WHERE route_id = ? AND status = 'ACTIVE'
      ORDER BY stop_order, id`,
    [trip.routeId],
  );
  const [fares] = await getDatabase(database).query(
    `SELECT bt.id AS bookingTypeId, bt.type_name AS typeName,
            COALESCE(f.base_price, t.price) AS farePerSeat
       FROM booking_types bt
       JOIN trips t ON t.id = ?
       LEFT JOIN fares f ON f.id = (
         SELECT f2.id FROM fares f2
          WHERE f2.route_id = t.route_id
            AND f2.booking_type_id = bt.id AND f2.is_active = 1
            AND (f2.vehicle_type_id = (SELECT vehicle_type_id FROM vehicles WHERE id = t.vehicle_id)
              OR f2.vehicle_type_id IS NULL)
          ORDER BY (f2.vehicle_type_id IS NOT NULL) DESC, f2.id DESC LIMIT 1
       )
      WHERE bt.is_active = 1
      ORDER BY bt.id`,
    [tripId],
  );
  return {
    tripId: String(trip.tripId),
    routeId: String(trip.routeId),
    routeName: `${trip.origin} → ${trip.destination}`,
    departureTime: trip.departureTime,
    price: trip.price === null ? null : Number(trip.price),
    status: trip.status,
    vehicleName: trip.vehicleName,
    totalSeats: Number(trip.totalSeats),
    stops: stops.map((stop) => ({ ...stop, stopId: String(stop.stopId) })),
    fareOptions: fares.map((fare) => ({
      bookingTypeId: String(fare.bookingTypeId),
      typeName: fare.typeName,
      farePerSeat: fare.farePerSeat === null ? null : Number(fare.farePerSeat),
    })),
  };
};

const getTripSeats = async (tripId, database) => {
  const [trips] = await getDatabase(database).query(
    `SELECT t.id, v.seat_count AS totalSeats
       FROM trips t JOIN vehicles v ON v.id = t.vehicle_id
      WHERE t.id = ? LIMIT 1`,
    [tripId],
  );
  if (!trips[0]) throw createHttpError(404, "TRIP_NOT_FOUND", "Chuyến xe không tồn tại");
  const [seats] = await getDatabase(database).query(
    `SELECT bs.seat_number AS seatNumber
       FROM booking_seats bs
       JOIN bookings b ON b.id = bs.booking_id
      WHERE bs.trip_id = ?
        AND (b.booking_status = 'CONFIRMED'
          OR (b.booking_status = 'PENDING' AND b.expires_at > CURRENT_TIMESTAMP(3)))
      ORDER BY CAST(bs.seat_number AS UNSIGNED)`,
    [tripId],
  );
  const bookedSeats = seats.map((row) => String(row.seatNumber));
  return {
    tripId: String(tripId),
    totalSeats: Number(trips[0].totalSeats),
    bookedSeats,
    availableSeats: Number(trips[0].totalSeats) - bookedSeats.length,
  };
};

const getBookingDetail = async (bookingId, customerId, database) => {
  const [rows] = await getDatabase(database).query(
    `SELECT b.id AS bookingId, b.customer_id AS customerId,
            b.trip_id AS tripId, b.seat_count AS seatCount,
            b.fare_per_seat AS farePerSeat, b.total_fare AS totalFare,
            b.customer_name AS customerName, b.contact_phone AS contactPhone,
            b.driver_note AS driverNote, b.pickup_address AS pickupAddress,
            b.dropoff_address AS dropoffAddress,
            b.booking_status AS bookingStatus, b.payment_status AS paymentStatus,
            b.expires_at AS expiresAt,
            t.departure_time AS departureTime,
            r.origin, r.destination,
            v.license_plate AS vehicleName,
            p.id AS transactionId, p.payment_method AS paymentMethod,
            s1.stop_name AS pickupPoint, s2.stop_name AS dropoffPoint
       FROM bookings b
       JOIN trips t ON t.id = b.trip_id
       JOIN routes r ON r.id = t.route_id
       JOIN vehicles v ON v.id = t.vehicle_id
       JOIN stops s1 ON s1.id = b.pickup_point_id
       JOIN stops s2 ON s2.id = b.dropoff_point_id
       LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'SUCCESS'
      WHERE b.id = ? AND b.customer_id = ?
      LIMIT 1`,
    [bookingId, customerId],
  );
  const booking = rows[0];
  if (!booking) throw createHttpError(404, "BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt chuyến");
  const [seats] = await getDatabase(database).query(
    "SELECT seat_number AS seatNumber FROM booking_seats WHERE booking_id = ? ORDER BY CAST(seat_number AS UNSIGNED)",
    [bookingId],
  );
  return {
    bookingId: booking.bookingId,
    tripId: String(booking.tripId),
    seatNumbers: seats.map((seat) => String(seat.seatNumber)),
    seatCount: Number(booking.seatCount),
    farePerSeat: Number(booking.farePerSeat),
    totalFare: Number(booking.totalFare),
    customerName: booking.customerName,
    contactPhone: booking.contactPhone,
    driverNote: booking.driverNote,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    bookingStatus: booking.bookingStatus === "PENDING" &&
      booking.paymentStatus === "PENDING" &&
      new Date(booking.expiresAt).getTime() <= Date.now()
      ? "EXPIRED" : booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    expiresAt: booking.expiresAt,
    departureTime: booking.departureTime,
    routeName: `${booking.origin} → ${booking.destination}`,
    vehicleName: booking.vehicleName,
    pickupPoint: booking.pickupPoint,
    dropoffPoint: booking.dropoffPoint,
    transactionId: booking.transactionId || null,
    paymentMethod: booking.paymentMethod || null,
  };
};

module.exports = {
  getBookingDetail,
  getTripDetail,
  getTripSeats,
  listBookingTypes,
  listRoutes,
  listTrips,
};
