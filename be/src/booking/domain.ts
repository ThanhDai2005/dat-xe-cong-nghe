import { z } from "zod";
import { ensure } from "../core/errors";
import { normalizeVnPhone } from "../auth/validation";

export const idSchema = z.string().regex(/^[1-9]\d{0,19}$/);
export const positionSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().gt(-180).max(180),
}).strict();
export const quoteSchema = z.object({
  pickup: positionSchema.extend({ address: z.string().trim().min(3).max(255) }),
  destination: positionSchema.extend({ address: z.string().trim().min(3).max(255) }),
  departureAt: z.string().datetime({ offset: true }),
  seatCount: z.number().int().min(1).max(6),
}).strict();
export const createSchema = z.object({
  quoteId: z.string().uuid(),
  contactName: z.string().trim().min(2).max(150),
  contactPhone: z.string().transform((value, ctx) => {
    const phone = normalizeVnPhone(value);
    if (!phone) { ctx.addIssue({ code: "custom", message: "Số điện thoại không hợp lệ" }); return z.NEVER; }
    return phone;
  }),
  note: z.string().trim().max(500).default(""),
}).strict();
export const reasonSchema = z.object({ reason: z.string().trim().min(5).max(500) }).strict();
export type QuoteInput = z.infer<typeof quoteSchema>;
export type Position = z.infer<typeof positionSchema>;
export function validateDeparture(departureAt: string, now = Date.now()) {
  ensure(Date.parse(departureAt) - now >= 5 * 3600_000, 400, "DEPARTURE_TOO_SOON", "Phải đặt trước giờ khởi hành ít nhất 5 tiếng");
}
export function wkt(point: Position) { return `POINT(${point.lng} ${point.lat})`; }
export function cents(value: string | number): bigint {
  const text = String(value);
  ensure(/^\d{1,13}(\.\d{1,2})?$/.test(text), 400, "INVALID_AMOUNT", "Số tiền không hợp lệ");
  const [whole, fraction = ""] = text.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}
export function money(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}
export function intermediaryFee(fare: string, seats: number, rate: string): bigint {
  const basisPoints = Math.round(Number(rate) * 10000);
  ensure(Number.isInteger(seats) && seats >= 1 && seats <= 6 && basisPoints >= 0 && basisPoints <= 10000,
    400, "INVALID_FEE_INPUT", "Dữ liệu tính phí không hợp lệ");
  return (cents(fare) * BigInt(seats) * BigInt(10000 - basisPoints) + 5000n) / 10000n;
}
