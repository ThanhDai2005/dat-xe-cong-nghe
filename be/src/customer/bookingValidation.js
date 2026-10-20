const { randomUUID } = require("crypto");

const ALLOWED_PAYMENT_METHODS = new Set([
  "CASH",
  "CARD",
  "MOMO",
  "VNPAY",
  "BANK_TRANSFER",
]);

const createHttpError = (statusCode, code, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const requireId = (value, fieldName) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw createHttpError(400, "VALIDATION_ERROR", `${fieldName} là bắt buộc`);
  }
  return String(value).trim();
};

const optionalText = (value, fieldName, maxLength) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw createHttpError(400, "VALIDATION_ERROR", `${fieldName} không hợp lệ`);
  }
  return value.trim() || null;
};

const validateBookingInput = (body = {}) => {
  if (!Array.isArray(body.seatNumbers) || body.seatNumbers.length === 0) {
    throw createHttpError(
      400,
      "VALIDATION_ERROR",
      "seatNumbers phải là một mảng có ít nhất một ghế",
    );
  }

  const rawSeatNumbers = body.seatNumbers.map((seat) => String(seat).trim());
  if (rawSeatNumbers.some((seat) => !/^\d+$/.test(seat) ||
    !Number.isSafeInteger(Number(seat)) || Number(seat) < 1)) {
    throw createHttpError(
      400,
      "INVALID_SEAT_NUMBER",
      "Mỗi ghế phải được biểu diễn bằng một số nguyên dương",
    );
  }
  const seatNumbers = rawSeatNumbers.map((seat) => String(Number(seat)));
  if (new Set(seatNumbers).size !== seatNumbers.length) {
    throw createHttpError(
      400,
      "DUPLICATE_SEAT_NUMBER",
      "Danh sách ghế không được chứa ghế trùng nhau",
    );
  }

  return {
    customerId: requireId(body.customerId, "customerId"),
    tripId: requireId(body.tripId, "tripId"),
    seatNumbers,
    pickupPointId: requireId(body.pickupPointId, "pickupPointId"),
    dropoffPointId: requireId(body.dropoffPointId, "dropoffPointId"),
    bookingTypeId: requireId(body.bookingTypeId, "bookingTypeId"),
    customerName: optionalText(body.customerName, "customerName", 100),
    contactPhone: optionalText(body.contactPhone, "contactPhone", 32),
    driverNote: optionalText(body.driverNote, "driverNote", 1000),
    pickupAddress: optionalText(body.pickupAddress, "pickupAddress", 255),
    dropoffAddress: optionalText(body.dropoffAddress, "dropoffAddress", 255),
  };
};

const validatePaymentInput = (body = {}) => {
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createHttpError(400, "INVALID_PAYMENT_AMOUNT", "amount phải là số dương");
  }

  const paymentMethod = String(body.paymentMethod || "").trim().toUpperCase();
  if (!ALLOWED_PAYMENT_METHODS.has(paymentMethod)) {
    throw createHttpError(
      400,
      "INVALID_PAYMENT_METHOD",
      "paymentMethod không được hỗ trợ",
    );
  }

  return {
    bookingId: requireId(body.bookingId, "bookingId"),
    paymentMethod,
    amount,
  };
};

const calculateTotalFare = (farePerSeat, seatCount) => {
  const price = Number(farePerSeat);
  if (!Number.isFinite(price) || price <= 0) {
    throw createHttpError(
      422,
      "FARE_NOT_CONFIGURED",
      "Chuyến xe chưa được cấu hình giá vé hợp lệ",
    );
  }
  return Number((price * seatCount).toFixed(2));
};

const moneyEquals = (left, right) =>
  Math.round(Number(left) * 100) === Math.round(Number(right) * 100);

module.exports = {
  ALLOWED_PAYMENT_METHODS,
  calculateTotalFare,
  createHttpError,
  moneyEquals,
  randomUUID,
  validateBookingInput,
  validatePaymentInput,
};
