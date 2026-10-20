import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { redis } from "../redis";
import type { UserRow } from "./types";

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 14 * 24 * 60 * 60;
const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const refreshKey = (userId: string, familyId: string) => `auth:refresh:${userId}:${familyId}`;
const familiesKey = (userId: string) => `auth:families:${userId}`;

export function accessTokenFor(user: UserRow): string {
  return jwt.sign({ role: user.role, status: user.status }, config.JWT_ACCESS_SECRET, {
    subject: user.id,
    jwtid: crypto.randomUUID(),
    expiresIn: ACCESS_TTL_SECONDS,
    algorithm: "HS256",
  });
}

export async function verifyAccessToken(token: string): Promise<jwt.JwtPayload> {
  const payload = jwt.verify(token, config.JWT_ACCESS_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
  if (!payload.sub || !payload.jti || await redis.exists(`auth:blocklist:${payload.jti}`)) {
    throw new Error("Invalid session");
  }
  return payload;
}

export async function issueSession(user: UserRow) {
  const familyId = crypto.randomUUID();
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  const pipeline = redis.pipeline();
  pipeline.set(refreshKey(user.id, familyId), hash(refreshToken), "EX", REFRESH_TTL_SECONDS);
  pipeline.sadd(familiesKey(user.id), familyId);
  pipeline.expire(familiesKey(user.id), REFRESH_TTL_SECONDS);
  await pipeline.exec();
  return { accessToken: accessTokenFor(user), refreshToken, familyId, expiresIn: ACCESS_TTL_SECONDS };
}

const ROTATE_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if not current then return 0 end
if current ~= ARGV[1] then return -1 end
redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
return 1
`;

export async function rotateSession(user: UserRow, familyId: string, oldToken: string) {
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  const result = await redis.eval(ROTATE_SCRIPT, 1, refreshKey(user.id, familyId), hash(oldToken), hash(refreshToken), REFRESH_TTL_SECONDS);
  if (result !== 1) throw new Error("INVALID_REFRESH_TOKEN");
  return { accessToken: accessTokenFor(user), refreshToken, familyId, expiresIn: ACCESS_TTL_SECONDS };
}

export async function revokeSession(userId: string, familyId: string) {
  await redis.multi().del(refreshKey(userId, familyId)).srem(familiesKey(userId), familyId).exec();
}

export async function revokeAllSessions(userId: string) {
  const families = await redis.smembers(familiesKey(userId));
  const pipeline = redis.pipeline();
  for (const familyId of families) pipeline.del(refreshKey(userId, familyId));
  pipeline.del(familiesKey(userId));
  await pipeline.exec();
}

export async function blockAccessToken(payload: jwt.JwtPayload) {
  if (payload.jti && payload.exp) {
    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await redis.set(`auth:blocklist:${payload.jti}`, "1", "EX", ttl);
  }
}
