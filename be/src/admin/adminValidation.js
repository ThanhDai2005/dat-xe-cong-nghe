const { createHttpError } = require("../customer/bookingValidation");

const positiveId = (value, name) => {
  const text = String(value ?? "").trim();
  if (!/^[1-9]\d*$/.test(text)) {
    throw createHttpError(400, "VALIDATION_ERROR", `${name} phải là ID hợp lệ`);
  }
  return text;
};

const priceValue = (value, name = "basePrice") => {
  const price = Number(value);
  if (value === "" || value === null || value === undefined ||
    !Number.isFinite(price) || price <= 0 || price > 9999999999.99 ||
    Math.abs(Math.round(price * 100) - price * 100) > 1e-6) {
    throw createHttpError(400, "VALIDATION_ERROR", `${name} phải là số tiền dương, tối đa 2 chữ số thập phân`);
  }
  return price;
};

const fareInput = (body = {}) => ({
  routeId: positiveId(body.routeId, "routeId"),
  bookingTypeId: positiveId(body.bookingTypeId, "bookingTypeId"),
  vehicleTypeId: body.vehicleTypeId === undefined || body.vehicleTypeId === null || body.vehicleTypeId === ""
    ? null : positiveId(body.vehicleTypeId, "vehicleTypeId"),
  basePrice: priceValue(body.basePrice),
});

const departureValue = (value) => {
  if (!value || typeof value !== "string") {
    throw createHttpError(400, "VALIDATION_ERROR", "departureTime không được để trống");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    throw createHttpError(400, "VALIDATION_ERROR", "departureTime phải là thời điểm hợp lệ trong tương lai");
  }
  // Store formatted for MySQL (UTC)
  return date.toISOString().slice(0, 19).replace("T", " ");
};

const tripInput = (body = {}) => ({
  routeId: positiveId(body.routeId, "routeId"),
  vehicleId: positiveId(body.vehicleId, "vehicleId"),
  departureTime: departureValue(body.departureTime),
  price: priceValue(body.price, "price"),
});

module.exports = { positiveId, priceValue, fareInput, tripInput, departureValue };
