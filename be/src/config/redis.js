const Redis = require("ioredis");
require("./env");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on("connect", () => console.log("✅ Redis kết nối thành công!"));
redis.on("error", (err) => console.error("❌ Redis lỗi:", err.message));

module.exports = redis;
