import express from "express";
import cors from "cors";
import { config } from "./config";
import { authRouter } from "./auth/routes";
import { registerRouter } from "./auth/register";
import { googleRouter } from "./auth/google";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "32kb" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/auth", registerRouter);
app.use("/api/v1/auth", registerRouter);
app.use("/api/auth", googleRouter);
app.use("/api/v1/auth", googleRouter);
app.use((_req, res) => res.status(404).json({ success: false, message: "Route không tồn tại" }));
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ success: false, message: "Lỗi hệ thống" });
});
app.listen(config.PORT, () => console.log(`GoRide API listening on ${config.PORT}`));
