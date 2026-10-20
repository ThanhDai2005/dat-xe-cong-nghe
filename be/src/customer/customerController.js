const { createBooking } = require("./bookingService");
const { processPayment } = require("./paymentService");

const createBookingHandler = async (req, res, next) => {
  try {
    const data = await createBooking(req.body, req.user?.sub);
    return res.status(201).json({
      success: true,
      message: "Giữ chỗ và tạo đơn đặt chuyến thành công",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const processPaymentHandler = async (req, res, next) => {
  try {
    const data = await processPayment(req.body, req.user?.sub);
    return res.status(200).json({
      success: true,
      message: "Thanh toán thành công",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createBookingHandler, processPaymentHandler };
