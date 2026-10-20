import express from "express";
import cors from "cors";
import { authRouter } from "./auth/routes";
import { registerRouter } from "./auth/register";
import { googleRouter } from "./auth/google";
import { otpRouter } from "./auth/otp";
import adminRouter from "./admin/adminRouter";
import { errorHandler } from "./core/errors";
import { bookingRouter } from "./booking/routes";
import { cancellationRouter } from "./booking/cancellation";
import { lookupRouter } from "./booking/lookup";
import { db } from "./database";
import { redis } from "./redis";

export const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "32kb" }));
app.get("/health", async (_req, res) => {
  try {
    await Promise.all([db.query("SELECT 1"), redis.ping()]);
    res.json({ status: "ok" });
  } catch { res.status(503).json({ status: "unavailable" }); }
});
for (const prefix of ["/api/auth", "/api/v1/auth"]) {
  app.use(prefix, authRouter, registerRouter, googleRouter, otpRouter);
}
app.use("/api/v1/admin", adminRouter);
app.use("/api/admin", adminRouter);
app.use("/api/v1", bookingRouter);
app.use("/api/v1", cancellationRouter);
app.use("/api/v1", lookupRouter);
app.use((_req, res) => res.status(404).json({ success: false, message: "Route không tồn tại" }));
app.use(errorHandler);
