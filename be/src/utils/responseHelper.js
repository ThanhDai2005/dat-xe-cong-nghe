/**
 * Chuẩn hóa cấu trúc phản hồi API thành công
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {*} [options.data=null] - Dữ liệu trả về
 * @param {string} [options.message="Thành công"] - Thông báo
 * @param {Object} [options.pagination=null] - Thông tin phân trang (nếu có)
 * @param {number} [options.statusCode=200] - HTTP status code
 */
const sendSuccess = (res, { data = null, message = "Thành công", pagination = null, statusCode = 200 } = {}) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Chuẩn hóa cấu trúc phản hồi lỗi API
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {string} [options.message="Đã có lỗi xảy ra"] - Thông báo lỗi
 * @param {string} [options.code="INTERNAL_ERROR"] - Mã lỗi nghiệp vụ
 * @param {number} [options.statusCode=500] - HTTP status code
 */
const sendError = (res, { message = "Đã có lỗi xảy ra", code = "INTERNAL_ERROR", statusCode = 500 } = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
