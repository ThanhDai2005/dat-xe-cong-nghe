const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateTotalFare,
  moneyEquals,
  validateBookingInput,
  validatePaymentInput,
} = require("../src/customer/bookingValidation");

test("chuẩn hóa dữ liệu đặt chuyến hợp lệ", () => {
  assert.deepEqual(
    validateBookingInput({
      customerId: " customer-1 ",
      tripId: 10,
      seatNumbers: [1, "2"],
      pickupPointId: 3,
      dropoffPointId: 4,
      bookingTypeId: 2,
    }),
    {
      customerId: "customer-1",
      tripId: "10",
      seatNumbers: ["1", "2"],
      pickupPointId: "3",
      dropoffPointId: "4",
      bookingTypeId: "2",
      customerName: null,
      contactPhone: null,
      driverNote: null,
      pickupAddress: null,
      dropoffAddress: null,
    },
  );
});

test("từ chối ghế trùng nhau", () => {
  assert.throws(
    () =>
      validateBookingInput({
        customerId: 1,
        tripId: 1,
        seatNumbers: ["02", 2],
        pickupPointId: 1,
        dropoffPointId: 2,
        bookingTypeId: 1,
      }),
    (error) => error.code === "DUPLICATE_SEAT_NUMBER" && error.statusCode === 400,
  );
});

test("tính tổng giá theo số ghế", () => {
  assert.equal(calculateTotalFare("125000.50", 3), 375001.5);
});

test("chuẩn hóa phương thức thanh toán", () => {
  assert.deepEqual(
    validatePaymentInput({ bookingId: "b-1", paymentMethod: "momo", amount: "250000" }),
    { bookingId: "b-1", paymentMethod: "MOMO", amount: 250000 },
  );
});

test("so sánh tiền theo đơn vị nhỏ nhất", () => {
  assert.equal(moneyEquals("100.10", 100.1), true);
  assert.equal(moneyEquals("100.10", 100.11), false);
});
