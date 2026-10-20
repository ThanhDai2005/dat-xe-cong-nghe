import { Router } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import { ensure } from "../core/errors";
import { once } from "../core/transaction";
import { idSchema, reasonSchema, cents, money } from "./domain";
import { lockedBooking, audit } from "./service";

export const cancellationRouter = Router();
cancellationRouter.use(requireAuth);
cancellationRouter.post("/customer/bookings/:id/cancel", requireRole("CUSTOMER"), async (req, res) => {
  const id = idSchema.parse(req.params.id), input = reasonSchema.parse(req.body);
  const result = await once(req.user!.sub, `booking:${id}:cancel`, req.header("idempotency-key"), input, async (c) => {
    const booking = await lockedBooking(c, id);
    ensure(booking.customer_user_id === req.user!.sub, 404, "BOOKING_NOT_FOUND", "Không tìm thấy đơn");
    ensure(booking.status === "OPEN" && Number(booking.expired) === 0, 409, "CANNOT_CANCEL", "Chỉ được tự hủy đơn còn OPEN và chưa quá giờ");
    await c.execute("UPDATE booking_requests SET status = 'CLOSE' WHERE id = ?", [id]);
    await c.execute("UPDATE booking_details SET closed_at = UTC_TIMESTAMP(3), closed_reason = ? WHERE booking_id = ?", [input.reason, id]);
    await audit(c, id, req.user!.sub, "OPEN", "CLOSE", input.reason);
    return { bookingId: id, status: "CLOSE" };
  });
  res.json({ success: true, data: result });
});
cancellationRouter.post("/admin/bookings/:id/fee-refund", requireRole("ADMIN"), async (req, res) => {
  const id = idSchema.parse(req.params.id), input = reasonSchema.parse(req.body);
  const result = await once(req.user!.sub, `booking:${id}:refund`, req.header("idempotency-key"), input, async (c) => {
    await lockedBooking(c, id);
    const [existing] = await c.execute<RowDataPacket[]>("SELECT id FROM fee_refunds WHERE booking_id = ?", [id]);
    ensure(!existing.length, 409, "ALREADY_REFUNDED", "Phí đơn này đã được hoàn");
    const [fees] = await c.execute<RowDataPacket[]>(
      "SELECT * FROM wallet_transactions WHERE booking_request_id = ? AND transaction_type = 'INTERMEDIARY_FEE'", [id]);
    const fee = fees[0];
    ensure(fee && Number(fee.amount_delta) < 0, 409, "NO_REFUNDABLE_FEE", "Đơn chưa có phí trung gian được thu");
    const [wallets] = await c.execute<RowDataPacket[]>("SELECT * FROM driver_wallets WHERE id = ? FOR UPDATE", [fee.wallet_id]);
    ensure(wallets[0], 409, "WALLET_NOT_FOUND", "Không tìm thấy ví");
    const amount = cents(String(fee.amount_delta).slice(1));
    const balance = money(cents(wallets[0].balance) + amount);
    await c.execute("UPDATE driver_wallets SET balance = ? WHERE id = ?", [balance, fee.wallet_id]);
    // Preserve the original fee's unique booking_request_id and immutable ledger.
    const [entry] = await c.execute<ResultSetHeader>(
      "INSERT INTO wallet_transactions (wallet_id, transaction_type, amount_delta, balance_after) VALUES (?, 'FEE_REFUND', ?, ?)",
      [fee.wallet_id, money(amount), balance]);
    const transactionId = String(entry.insertId);
    await c.execute("INSERT INTO wallet_transaction_details (transaction_id, performed_by, reason, related_booking_id) VALUES (?, ?, ?, ?)",
      [transactionId, req.user!.sub, input.reason, id]);
    await c.execute(`INSERT INTO fee_refunds (original_transaction_id, refund_transaction_id, booking_id, performed_by, reason)
      VALUES (?, ?, ?, ?, ?)`, [fee.id, transactionId, id, req.user!.sub, input.reason]);
    return { bookingId: id, transactionId, amount: money(amount), balance };
  });
  res.json({ success: true, data: result });
});
