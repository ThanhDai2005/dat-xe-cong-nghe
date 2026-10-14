import { Router, type RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../database";
import { redis } from "../redis";
import { blockAccessToken, issueSession, revokeAllSessions, revokeSession, rotateSession, verifyAccessToken } from "./sessions";
import { publicUser, type UserRow } from "./types";

export const authRouter = Router();
const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
  clientRole: z.enum(["CUSTOMER", "DRIVER", "ADMIN"]),
});
const refreshSchema = z.object({ userId: z.string().uuid(), familyId: z.string().uuid(), refreshToken: z.string().min(1) });

async function getUser(identifier: string): Promise<UserRow | undefined> {
  const [rows] = await db.execute<UserRow[]>(
    "SELECT id, full_name, email, phone, password_hash, role, status FROM users WHERE email = ? OR phone = ? LIMIT 1",
    [identifier, identifier],
  );
  return rows[0];
}

const loginHandler: RequestHandler = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, message: "Thông tin đăng nhập không hợp lệ" }); return; }
  const { identifier, password, clientRole } = parsed.data;
  const bruteKey = `auth:brute:${identifier.toLowerCase()}`;
  if (Number(await redis.get(bruteKey)) >= 5) {
    res.status(429).json({ success: false, message: "Thử lại sau 15 phút" }); return;
  }
  const user = await getUser(identifier);
  const valid = user?.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
  if (!valid || user?.role !== clientRole) {
    const count = await redis.incr(bruteKey);
    if (count === 1) await redis.expire(bruteKey, 15 * 60);
    res.status(401).json({ success: false, message: "Thông tin đăng nhập không chính xác" }); return;
  }
  if (user.status !== "ACTIVE") {
    res.status(403).json({ success: false, message: "Tài khoản chưa được kích hoạt hoặc đã bị khóa" }); return;
  }
  await redis.del(bruteKey);
  res.json({ success: true, message: "Đăng nhập thành công", data: { user: publicUser(user), tokens: await issueSession(user) } });
};

authRouter.post("/login", loginHandler);
authRouter.post("/v1/login", loginHandler);

authRouter.post("/refresh-token", async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, message: "Thiếu thông tin phiên" }); return; }
  const { userId, familyId, refreshToken } = parsed.data;
  const [rows] = await db.execute<UserRow[]>(
    "SELECT id, full_name, email, phone, password_hash, role, status FROM users WHERE id = ? LIMIT 1", [userId],
  );
  const user = rows[0];
  if (!user || user.status !== "ACTIVE") { res.status(401).json({ success: false, message: "Phiên không hợp lệ" }); return; }
  try {
    res.json({ success: true, data: { tokens: await rotateSession(user, familyId, refreshToken) } });
  } catch {
    res.status(401).json({ success: false, message: "Phiên không hợp lệ" });
  }
});

authRouter.post("/logout", async (req, res) => {
  const bearer = req.header("authorization")?.replace(/^Bearer /i, "");
  if (!bearer) { res.status(401).json({ success: false, message: "Thiếu access token" }); return; }
  try {
    const payload = await verifyAccessToken(bearer);
    if (req.body?.allDevices) await revokeAllSessions(payload.sub!);
    else if (typeof req.body?.familyId === "string") await revokeSession(payload.sub!, req.body.familyId);
    await blockAccessToken(payload);
    res.json({ success: true, message: "Đăng xuất thành công" });
  } catch {
    res.status(401).json({ success: false, message: "Phiên không hợp lệ" });
  }
});
