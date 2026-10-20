import type { RequestHandler } from "express";
import type { RowDataPacket } from "mysql2";
import { db } from "../database";
import { verifyAccessToken } from "../auth/sessions";
import { ApiError } from "../core/errors";

export type Role = "CUSTOMER" | "DRIVER" | "ADMIN";
declare global {
  namespace Express {
    interface Request { user?: { sub: string; role: Role; status: string }; }
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const match = req.header("authorization")?.match(/^Bearer (\S+)$/i);
  if (!match) throw new ApiError(401, "UNAUTHORIZED", "Vui lòng đăng nhập");
  let userId: string;
  try { userId = (await verifyAccessToken(match[1])).sub!; }
  catch { throw new ApiError(401, "TOKEN_INVALID", "Phiên không hợp lệ hoặc đã hết hạn"); }
  const [rows] = await db.execute<(RowDataPacket & { id: string; role: Role; status: string })[]>(
    "SELECT id, role, status FROM users WHERE id = ?", [userId],
  );
  const user = rows[0];
  if (!user || user.status.toUpperCase() !== "ACTIVE") throw new ApiError(403, "ACCOUNT_INACTIVE", "Tài khoản không hoạt động");
  req.user = { sub: user.id, role: user.role, status: user.status };
  next();
};

export const requireRole = (...roles: Role[]): RequestHandler => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) throw new ApiError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này");
  next();
};
