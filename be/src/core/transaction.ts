import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { createHash } from "node:crypto";
import { db } from "../database";
import { ensure } from "./errors";

export async function transaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]),
  );
  return value;
}

// The idempotency record and business mutation commit or roll back together.
export async function once<T>(
  userId: string, scope: string, key: string | undefined, body: unknown,
  work: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  ensure(key && /^[A-Za-z0-9_.:-]{8,100}$/.test(key), 400, "IDEMPOTENCY_KEY_REQUIRED", "Cần Idempotency-Key từ 8 đến 100 ký tự");
  const digest = createHash("sha256").update(JSON.stringify(canonical(body))).digest("hex");
  return transaction(async (connection) => {
    await connection.execute(
      "INSERT INTO api_operations (user_id, scope, operation_key, request_hash) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE operation_key = operation_key",
      [userId, scope, key, digest],
    );
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT request_hash, response_json FROM api_operations WHERE user_id = ? AND scope = ? AND operation_key = ? FOR UPDATE",
      [userId, scope, key],
    );
    ensure(rows[0].request_hash === digest, 409, "IDEMPOTENCY_CONFLICT", "Mã yêu cầu đã được dùng với dữ liệu khác");
    if (rows[0].response_json !== null) return (typeof rows[0].response_json === "string" ? JSON.parse(rows[0].response_json) : rows[0].response_json) as T;
    const result = await work(connection);
    await connection.execute(
      "UPDATE api_operations SET response_json = ? WHERE user_id = ? AND scope = ? AND operation_key = ?",
      [JSON.stringify(result), userId, scope, key],
    );
    return result;
  });
}
