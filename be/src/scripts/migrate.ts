import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { config } from "../config";

export async function migrate(): Promise<void> {
  let connection: mysql.Connection | undefined;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      connection = await mysql.createConnection({
        host: config.DB_HOST,
        port: config.DB_PORT,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        multipleStatements: true,
        ssl: config.DB_SSL_CA ? { ca: await fs.readFile(config.DB_SSL_CA) } : undefined,
      });
      break;
    } catch (error) {
      if (attempt === 19) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  if (!connection) throw new Error("MySQL chưa sẵn sàng");
  try {
    await connection.query("CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3))");
    const dir = path.resolve(process.cwd(), "migrations");
    for (const file of (await fs.readdir(dir)).filter((name) => name.endsWith(".sql")).sort()) {
      const [rows] = await connection.query<mysql.RowDataPacket[]>("SELECT name FROM schema_migrations WHERE name = ?", [file]);
      if (rows.length) continue;
      await connection.query(await fs.readFile(path.join(dir, file), "utf8"));
      await connection.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
      console.log(`Applied ${file}`);
    }
  } finally {
    await connection.end();
  }
}

if (require.main === module) migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
