const test = require("node:test");
const assert = require("node:assert/strict");
const { createBooking } = require("../src/customer/bookingService");
const { processPayment } = require("../src/customer/paymentService");

const createMockDatabase = (queryHandler) => {
  const state = { began: 0, committed: 0, rolledBack: 0, released: 0, queries: [] };
  const connection = {
    async beginTransaction() {
      state.began += 1;
    },
    async commit() {
      state.committed += 1;
    },
    async rollback() {
      state.rolledBack += 1;
    },
    release() {
      state.released += 1;
    },
    async query(sql, params) {
      state.queries.push({ sql, params });
      return queryHandler(sql, params);
    },
  };
  return {
    state,
    database: { async getConnection() { return connection; } },
  };
};

test("đặt chuyến giữ ghế và tính giá trong một transaction", async () => {
  const { database, state } = createMockDatabase(async (sql) => {
    if (sql.includes("FROM users")) return [[{ id: "u1", role: "CUSTOMER", status: "ACTIVE" }]];
    if (sql.includes("FROM trips")) {
      return [[{
        id: 8,
        route_id: 2,
        vehicle_id: 3,
        departure_time: new Date(Date.now() + 3_600_000),
        price: 150000,
        status: "OPEN",
        seat_count: 7,
        route_status: "ACTIVE",
        vehicle_status: "ACTIVE",
      }]];
    }
    if (sql.includes("FROM stops")) {
      return [[
        { id: 11, route_id: 2, type: "BOTH", stop_order: 1, status: "ACTIVE" },
        { id: 12, route_id: 2, type: "BOTH", stop_order: 2, status: "ACTIVE" },
      ]];
    }
    if (sql.includes("FROM booking_types")) return [[{ id: 1 }]];
    if (sql.includes("SELECT seat_number")) return [[]];
    if (sql.includes("FROM fares")) return [[{ base_price: "120000.00" }]];
    return [{ affectedRows: 1 }];
  });

  const result = await createBooking(
    {
      customerId: "u1",
      tripId: 8,
      seatNumbers: [1, 2],
      pickupPointId: 11,
      dropoffPointId: 12,
      bookingTypeId: 1,
      customerName: "Nguyễn An",
      contactPhone: "+84 912345678",
      driverNote: "Đón tại cổng chính",
      pickupAddress: "Điểm A",
      dropoffAddress: "Điểm B",
    },
    "u1",
    database,
  );

  assert.equal(result.totalFare, 240000);
  assert.equal(result.paymentStatus, "PENDING");
  assert.match(result.bookingId, /^[0-9a-f-]{36}$/);
  assert.equal(state.began, 1);
  assert.equal(state.committed, 1);
  assert.equal(state.rolledBack, 0);
  assert.equal(state.released, 1);
  assert.equal(state.queries.some(({ sql }) => sql.includes("INSERT INTO booking_seats")), true);
  const bookingInsert = state.queries.find(({ sql }) => sql.includes("INSERT INTO bookings"));
  assert.equal((bookingInsert.sql.match(/\?/g) || []).length, bookingInsert.params.length);
  assert.equal(bookingInsert.params.includes("Nguyễn An"), true);
  assert.equal(bookingInsert.params.includes("Đón tại cổng chính"), true);
});

test("thanh toán giả lập xác nhận đơn khi số tiền khớp", async () => {
  const { database, state } = createMockDatabase(async (sql) => {
    if (sql.includes("FROM bookings")) {
      return [[{
        id: "b1",
        customer_id: "u1",
        total_fare: "240000.00",
        booking_status: "PENDING",
        payment_status: "PENDING",
        expires_at: new Date(Date.now() + 600_000),
      }]];
    }
    if (sql.includes("FROM payments")) return [[]];
    return [{ affectedRows: 1 }];
  });

  const result = await processPayment(
    { bookingId: "b1", paymentMethod: "momo", amount: 240000 },
    "u1",
    database,
  );

  assert.equal(result.status, "SUCCESS");
  assert.match(result.transactionId, /^[0-9a-f-]{36}$/);
  assert.equal(state.committed, 1);
  assert.equal(state.rolledBack, 0);
  assert.equal(state.queries.some(({ sql }) => sql.includes("INSERT INTO payments")), true);
  assert.equal(
    state.queries.some(({ sql }) => sql.includes("booking_status = 'CONFIRMED'")),
    true,
  );
});

test("đặt chuyến rollback khi ghế đã được giữ", async () => {
  const { database, state } = createMockDatabase(async (sql) => {
    if (sql.includes("FROM users")) return [[{ id: "u1", role: "CUSTOMER", status: "ACTIVE" }]];
    if (sql.includes("FROM trips")) {
      return [[{
        id: 8,
        route_id: 2,
        departure_time: new Date(Date.now() + 3_600_000),
        price: 150000,
        status: "OPEN",
        seat_count: 7,
        route_status: "ACTIVE",
        vehicle_status: "ACTIVE",
      }]];
    }
    if (sql.includes("FROM stops")) {
      return [[
        { id: 11, route_id: 2, type: "BOTH", stop_order: 1, status: "ACTIVE" },
        { id: 12, route_id: 2, type: "BOTH", stop_order: 2, status: "ACTIVE" },
      ]];
    }
    if (sql.includes("FROM booking_types")) return [[{ id: 1 }]];
    if (sql.includes("SELECT seat_number")) return [[{ seat_number: "2" }]];
    return [{ affectedRows: 1 }];
  });

  await assert.rejects(
    createBooking(
      {
        customerId: "u1",
        tripId: 8,
        seatNumbers: [2],
        pickupPointId: 11,
        dropoffPointId: 12,
        bookingTypeId: 1,
      },
      "u1",
      database,
    ),
    (error) => error.code === "SEAT_UNAVAILABLE" && error.statusCode === 409,
  );
  assert.equal(state.committed, 0);
  assert.equal(state.rolledBack, 1);
  assert.equal(state.released, 1);
});

test("không giữ ghế khi xe đã ngừng hoạt động", async () => {
  const { database, state } = createMockDatabase(async (sql) => {
    if (sql.includes("FROM users")) return [[{ id: "u1", role: "CUSTOMER", status: "ACTIVE" }]];
    if (sql.includes("FROM trips")) return [[{
      id: 8,
      route_id: 2,
      departure_time: new Date(Date.now() + 3_600_000),
      price: 150000,
      status: "OPEN",
      seat_count: 7,
      route_status: "ACTIVE",
      vehicle_status: "INACTIVE",
    }]];
    return [{ affectedRows: 1 }];
  });

  await assert.rejects(
    createBooking({
      customerId: "u1", tripId: 8, seatNumbers: [1],
      pickupPointId: 11, dropoffPointId: 12, bookingTypeId: 1,
    }, "u1", database),
    (error) => error.code === "TRIP_NOT_OPEN" && error.statusCode === 409,
  );
  assert.equal(state.rolledBack, 1);
});

test("thanh toán rollback khi số tiền không khớp", async () => {
  const { database, state } = createMockDatabase(async (sql) => {
    if (sql.includes("FROM bookings")) {
      return [[{
        id: "b1",
        customer_id: "u1",
        total_fare: "240000.00",
        booking_status: "PENDING",
        payment_status: "PENDING",
        expires_at: new Date(Date.now() + 600_000),
      }]];
    }
    if (sql.includes("FROM payments")) return [[]];
    return [{ affectedRows: 1 }];
  });

  await assert.rejects(
    processPayment(
      { bookingId: "b1", paymentMethod: "VNPAY", amount: 1 },
      "u1",
      database,
    ),
    (error) => error.code === "PAYMENT_AMOUNT_MISMATCH" && error.statusCode === 400,
  );
  assert.equal(state.committed, 0);
  assert.equal(state.rolledBack, 1);
  assert.equal(state.released, 1);
});
