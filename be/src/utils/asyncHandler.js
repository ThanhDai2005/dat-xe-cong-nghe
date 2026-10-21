const { sendError } = require("./responseHelper");

/**
 * Bọc controller function bất đồng bộ để tự động bắt lỗi và chuyển tiếp qua middleware lỗi
 * Giúp code controller gọn gàng, loại bỏ khối try-catch lặp đi lặp lại
 * @param {Function} fn - Controller function (req, res, next)
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    // Nếu có mã lỗi hoặc status code nghiệp vụ thì phản hồi theo chuẩn
    if (err.statusCode) {
      return sendError(res, {
        message: err.message,
        code: err.code || "BAD_REQUEST",
        statusCode: err.statusCode,
      });
    }
    // Chuyển tiếp tới global error handler nếu là lỗi hệ thống chưa định nghĩa
    next(err);
  });
};

module.exports = asyncHandler;
