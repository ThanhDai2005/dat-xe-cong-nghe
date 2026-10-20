const test = require("node:test");
const assert = require("node:assert/strict");
const { fareInput, tripInput } = require("../src/admin/adminValidation");
const { createFare, createTrip, updateTripStatus } = require("../src/admin/adminService");
const { vietnamDayBounds } = require("../src/utils/vietnamTime");

const mockDatabase = (handler) => {
  const state = { committed: 0, rolledBack: 0, released: 0, queries: [] };
  const connection = {
    async beginTransaction() {},
    async commit() { state.committed += 1; },
    async rollback() { state.rolledBack += 1; },
    release() { state.released += 1; },
    async query(sql, params) { state.queries.push({ sql, params }); return handler(sql, params); },
  };
  return { database: { async getConnection() { return connection; } }, state };
};

test("kiểm tra đầu vào giá vé và ngày giờ", () => {
  assert.deepEqual(fareInput({ routeId: 1, bookingTypeId: 2, basePrice: 0.29 }), {
    routeId: "1", bookingTypeId: "2", vehicleTypeId: null, basePrice: 0.29,
  });
  assert.throws(() => fareInput({ routeId: 1, bookingTypeId: 2, basePrice: -1 }), /basePrice/);
  assert.throws(() => tripInput({ routeId: 1, vehicleId: 1, departureTime: "hôm nay", price: 100 }), /departureTime/);
  assert.deepEqual(vietnamDayBounds("2026-10-21"), ["2026-10-20 17:00:00", "2026-10-21 17:00:00"]);
  assert.throws(() => vietnamDayBounds("2026-02-31"), /date/);
});

test("tạo giá vé khóa tuyến và từ chối cấu hình trùng", async () => {
  const { database, state } = mockDatabase(async (sql) => {
    if (sql.includes("FROM routes")) return [[{ id: 1, status: "ACTIVE" }]];
    if (sql.includes("FROM booking_types")) return [[{ id: 2 }]];
    if (sql.includes("FROM fares")) return [[{ id: 9 }]];
    return [[]];
  });
  await assert.rejects(createFare({ routeId: 1, bookingTypeId: 2, basePrice: 100000 }, database), {
    code: "FARE_EXISTS", statusCode: 409,
  });
  assert.equal(state.committed, 0);
  assert.equal(state.rolledBack, 1);
  assert.equal(state.released, 1);
});

test("tạo chuyến từ chối xe trùng lịch", async () => {
  const { database, state } = mockDatabase(async (sql) => {
    if (sql.includes("FROM routes")) return [[{ id: 1, status: "ACTIVE", duration: 120 }]];
    if (sql.includes("FROM vehicles")) return [[{ id: 2, status: "ACTIVE" }]];
    if (sql.includes("FROM trips")) return [[{ id: 10 }]];
    return [[]];
  });
  const departureTime = new Date(Date.now() + 86400000).toISOString();
  await assert.rejects(createTrip({ routeId: 1, vehicleId: 2, departureTime, price: 150000 }, database), {
    code: "VEHICLE_SCHEDULE_CONFLICT", statusCode: 409,
  });
  assert.equal(state.rolledBack, 1);
  assert.equal(state.queries.some(({ sql }) => sql.includes("INSERT INTO trips")), false);
});

test("lên lịch chuyến hợp lệ với giờ UTC và trạng thái OPEN", async () => {
  const { database, state } = mockDatabase(async (sql) => {
    if (sql.includes("FROM routes")) return [[{ id: 1, status: "ACTIVE", duration: 90 }]];
    if (sql.includes("FROM vehicles")) return [[{ id: 2, status: "ACTIVE" }]];
    if (sql.includes("FROM trips")) return [[]];
    if (sql.includes("INSERT INTO trips")) return [{ insertId: 42 }];
    return [[]];
  });
  const result = await createTrip({ routeId: 1, vehicleId: 2,
    departureTime: "2027-01-01T08:00:00+07:00", price: 150000 }, database);
  assert.deepEqual(result, { tripId: "42", status: "OPEN" });
  assert.equal(state.committed, 1);
  const insert = state.queries.find(({ sql }) => sql.includes("INSERT INTO trips"));
  assert.equal(insert.params[2], "2027-01-01 01:00:00");
});

test("không hủy chuyến đã có khách", async () => {
  const { database, state } = mockDatabase(async (sql) => {
    if (sql.includes("FROM trips")) return [[{ id: 1, status: "OPEN", departureTime: new Date(Date.now() + 86400000) }]];
    if (sql.includes("FROM bookings")) return [[{ id: "booking" }]];
    return [[]];
  });
  await assert.rejects(updateTripStatus(1, { status: "CANCELLED" }, database), {
    code: "TRIP_HAS_BOOKINGS", statusCode: 409,
  });
  assert.equal(state.rolledBack, 1);
  assert.equal(state.queries.some(({ sql }) => sql.includes("UPDATE trips")), false);
});
