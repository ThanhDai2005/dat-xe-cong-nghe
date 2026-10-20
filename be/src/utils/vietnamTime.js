const { createHttpError } = require("../customer/bookingValidation");

const mysqlUtc = (date) => date.toISOString().slice(0, 19).replace("T", " ");

const vietnamDayBounds = (value) => {
  const day = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw createHttpError(400, "VALIDATION_ERROR", "date phải có dạng YYYY-MM-DD");
  }
  const start = new Date(`${day}T00:00:00+07:00`);
  if (Number.isNaN(start.getTime()) ||
    new Date(start.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10) !== day) {
    throw createHttpError(400, "VALIDATION_ERROR", "date không hợp lệ");
  }
  return [mysqlUtc(start), mysqlUtc(new Date(start.getTime() + 86400000))];
};

module.exports = { vietnamDayBounds };
