const createHttpError = (statusCode = 500, code = "INTERNAL_ERROR", message = "Đã có lỗi xảy ra") => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode;
  error.code = code;
  return error;
};

module.exports = { createHttpError };
