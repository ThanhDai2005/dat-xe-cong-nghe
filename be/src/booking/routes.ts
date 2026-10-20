import { Router } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { z } from "zod";
import { db } from "../database";
import { redis } from "../redis";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import { ensure } from "../core/errors";
import { once, transaction } from "../core/transaction";
import { idSchema, positionSchema, quoteSchema, createSchema, reasonSchema, cents, money, wkt } from "./domain";
import { quote, createBooking, accept, transition, driverFor } from "./service";

export const bookingRouter = Router();
bookingRouter.use(requireAuth);
bookingRouter.post("/customer/quotes", requireRole("CUSTOMER"), async (req, res) => {
  const body = quoteSchema.parse(req.body);
  const limitKey = `booking:quotes:${req.user!.sub}:${Math.floor(Date.now() / 60000)}`;
  const count = Number(await redis.eval("local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n", 1, limitKey));
  ensure(count <= 10, 429, "QUOTE_RATE_LIMIT", "Tối đa 10 lần báo giá mỗi phút");
  res.json({ success: true, data: await quote(req.user!.sub, body) });
});
bookingRouter.post("/customer/bookings", requireRole("CUSTOMER"), async (req, res) => {
  res.status(201).json({ success: true, data: await createBooking(req.user!.sub, req.header("idempotency-key"), createSchema.parse(req.body)) });
});
bookingRouter.put("/driver/location", requireRole("DRIVER"), async (req, res) => {
  const position = positionSchema.parse(req.body);
  await transaction(async (c) => {
    const driver = await driverFor(c, req.user!.sub);
    await c.execute(`INSERT INTO driver_current_locations (driver_id, current_position, updated_at)
      VALUES (?, ST_GeomFromText(?, 4326, 'axis-order=long-lat'), UTC_TIMESTAMP(3))
      ON DUPLICATE KEY UPDATE current_position = VALUES(current_position), updated_at = UTC_TIMESTAMP(3)`, [driver.id, wkt(position)]);
  });
  res.json({ success: true, data: position });
});
bookingRouter.post("/driver/bookings/:id/accept", requireRole("DRIVER"), async (req, res) => {
  z.object({}).strict().parse(req.body ?? {});
  res.json({ success: true, data: await accept(req.user!.sub, idSchema.parse(req.params.id), req.header("idempotency-key")) });
});
bookingRouter.post("/driver/bookings/:id/confirm", requireRole("DRIVER"), async (req, res) => {
  const input = z.object({ confirmed: z.boolean(), reason: z.string().trim().min(5).max(500).optional() }).strict().parse(req.body);
  ensure(input.confirmed || input.reason, 400, "REASON_REQUIRED", "Cần lý do khách không đi");
  res.json({ success: true, data: await transition(req.user!.sub, idSchema.parse(req.params.id), req.header("idempotency-key"),
    input.confirmed ? "CUSTOMER_CONFIRMED" : "CUSTOMER_NOT_CONFIRMED", input.reason) });
});
for (const [action, target] of [["start", "IN_PROGRESS"], ["complete", "COMPLETED"], ["fail", "NOT_COMPLETED"]] as const) {
  bookingRouter.post(`/driver/bookings/:id/${action}`, requireRole("DRIVER"), async (req, res) => {
    const reason = action === "fail" ? reasonSchema.parse(req.body).reason : "";
    if (action === "complete") z.object({ paymentConfirmed: z.literal(true) }).strict().parse(req.body);
    if (action === "start") z.object({}).strict().parse(req.body ?? {});
    res.json({ success: true, data: await transition(req.user!.sub, idSchema.parse(req.params.id), req.header("idempotency-key"), target, reason) });
  });
}
bookingRouter.get("/driver/wallet", requireRole("DRIVER"), async (req, res) => {
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT w.id, w.balance, d.points_balance, d.current_driver_rate FROM driver_wallets w JOIN driver_profiles d ON d.id = w.driver_id WHERE d.user_id = ?", [req.user!.sub],
  );
  ensure(rows[0], 404, "WALLET_NOT_FOUND", "Chưa có ví tài xế");
  res.json({ success: true, data: rows[0] });
});
bookingRouter.post("/admin/drivers/:id/wallet/credits", requireRole("ADMIN"), async (req, res) => {
  const driverId = idSchema.parse(req.params.id);
  const input = z.object({
    amount: z.string().regex(/^[1-9]\d{0,8}$/), reference: z.string().regex(/^[A-Za-z0-9_.:-]{8,100}$/),
    reason: z.string().trim().min(5).max(500),
  }).strict().parse(req.body);
  const result = await once(req.user!.sub, "wallet:credit", req.header("idempotency-key"), { driverId, ...input }, async (c) => {
    const [wallets] = await c.execute<RowDataPacket[]>("SELECT * FROM driver_wallets WHERE driver_id = ? FOR UPDATE", [driverId]);
    const wallet = wallets[0];
    ensure(wallet, 404, "WALLET_NOT_FOUND", "Không tìm thấy ví");
    const [duplicates] = await c.execute<RowDataPacket[]>("SELECT transaction_id FROM wallet_transaction_details WHERE external_reference = ?", [input.reference]);
    ensure(!duplicates.length, 409, "REFERENCE_ALREADY_USED", "Mã đối soát nạp tiền đã được sử dụng");
    const balance = money(cents(wallet.balance) + cents(input.amount));
    await c.execute("UPDATE driver_wallets SET balance = ? WHERE id = ?", [balance, wallet.id]);
    const [entry] = await c.execute<ResultSetHeader>(
      "INSERT INTO wallet_transactions (wallet_id, transaction_type, amount_delta, balance_after) VALUES (?, 'TOP_UP', ?, ?)",
      [wallet.id, input.amount, balance],
    );
    try {
      await c.execute("INSERT INTO wallet_transaction_details (transaction_id, performed_by, external_reference, reason) VALUES (?, ?, ?, ?)",
        [String(entry.insertId), req.user!.sub, input.reference, input.reason]);
    } catch (error) {
      ensure((error as { code?: string }).code !== "ER_DUP_ENTRY", 409, "REFERENCE_ALREADY_USED", "Mã đối soát nạp tiền đã được sử dụng");
      throw error;
    }
    return { transactionId: String(entry.insertId), balance };
  });
  res.status(201).json({ success: true, data: result });
});
