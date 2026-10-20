const {
  createHttpError,
  moneyEquals,
  randomUUID,
  validatePaymentInput,
} = require("./bookingValidation");

const processPayment = async (rawInput, authenticatedUserId, database) => {
  const input = validatePaymentInput(rawInput);
  const activeDatabase = database || require("../database");
  const connection = await activeDatabase.getConnection();
  let transactionOpen = false;

  try {
    await connection.beginTransaction();
    transactionOpen = true;
    const [bookingRows] = await connection.query(
      `SELECT id, customer_id, total_fare, booking_status,
              payment_status, expires_at
         FROM bookings
        WHERE id = ?
        LIMIT 1
        FOR UPDATE`,
      [input.bookingId],
    );
    const booking = bookingRows[0];
    if (!booking) {
      throw createHttpError(404, "BOOKING_NOT_FOUND", "Đơn đặt chuyến không tồn tại");
    }
    if (authenticatedUserId && String(booking.customer_id) !== String(authenticatedUserId)) {
      throw createHttpError(403, "BOOKING_FORBIDDEN", "Bạn không có quyền thanh toán đơn này");
    }

    const [paymentRows] = await connection.query(
      `SELECT id, payment_method, amount, status
         FROM payments
        WHERE booking_id = ?
        LIMIT 1`,
      [input.bookingId],
    );
    const existingPayment = paymentRows[0];
    if (existingPayment?.status === "SUCCESS") {
      if (
        existingPayment.payment_method === input.paymentMethod &&
        moneyEquals(existingPayment.amount, input.amount)
      ) {
        await connection.commit();
        transactionOpen = false;
        return { transactionId: existingPayment.id, status: "SUCCESS" };
      }
      throw createHttpError(409, "BOOKING_ALREADY_PAID", "Đơn đặt chuyến đã được thanh toán");
    }

    if (["CANCELLED", "EXPIRED"].includes(String(booking.booking_status).toUpperCase())) {
      throw createHttpError(409, "BOOKING_NOT_PAYABLE", "Đơn đặt chuyến không còn hiệu lực");
    }
    if (
      booking.payment_status === "PENDING" &&
      new Date(booking.expires_at).getTime() <= Date.now()
    ) {
      await connection.query("DELETE FROM booking_seats WHERE booking_id = ?", [input.bookingId]);
      await connection.query(
        `UPDATE bookings
            SET booking_status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP(3)
          WHERE id = ?`,
        [input.bookingId],
      );
      await connection.commit();
      transactionOpen = false;
      throw createHttpError(409, "BOOKING_EXPIRED", "Thời gian giữ ghế đã hết");
    }
    if (!moneyEquals(input.amount, booking.total_fare)) {
      throw createHttpError(
        400,
        "PAYMENT_AMOUNT_MISMATCH",
        `Số tiền thanh toán phải bằng ${Number(booking.total_fare)}`,
      );
    }

    const transactionId = existingPayment?.id || randomUUID();
    if (existingPayment) {
      await connection.query(
        `UPDATE payments
            SET payment_method = ?, amount = ?, status = 'SUCCESS',
                paid_at = CURRENT_TIMESTAMP(3), updated_at = CURRENT_TIMESTAMP(3)
          WHERE id = ?`,
        [input.paymentMethod, input.amount, transactionId],
      );
    } else {
      await connection.query(
        `INSERT INTO payments (
           id, booking_id, payment_method, amount, status, paid_at
         ) VALUES (?, ?, ?, ?, 'SUCCESS', CURRENT_TIMESTAMP(3))`,
        [transactionId, input.bookingId, input.paymentMethod, input.amount],
      );
    }
    await connection.query(
      `UPDATE bookings
          SET payment_status = 'PAID', booking_status = 'CONFIRMED',
              updated_at = CURRENT_TIMESTAMP(3)
        WHERE id = ?`,
      [input.bookingId],
    );

    await connection.commit();
    transactionOpen = false;
    return { transactionId, status: "SUCCESS" };
  } catch (error) {
    if (transactionOpen) await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { processPayment };
