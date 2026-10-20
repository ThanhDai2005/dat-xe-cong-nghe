import fs from "node:fs";
import mysql from "mysql2/promise";
import { config } from "./config";

export const db = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  ssl: config.DB_SSL_CA ? { ca: fs.readFileSync(config.DB_SSL_CA) } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: "Z",
  supportBigNumbers: true,
  bigNumberStrings: true,
});
