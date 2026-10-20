import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export function ensure(condition: unknown, status: number, code: string, message: string): asserts condition {
  if (!condition) throw new ApiError(status, code, message);
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ success: false, code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", errors: error.flatten() });
  } else if (error instanceof ApiError) {
    res.status(error.status).json({ success: false, code: error.code, message: error.message });
  } else if (error?.type === "entity.parse.failed") {
    res.status(400).json({ success: false, code: "INVALID_JSON", message: "JSON không hợp lệ" });
  } else if (["ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT"].includes(error?.code)) {
    res.status(409).json({ success: false, code: "CONCURRENT_OPERATION", message: "Có thao tác đồng thời. Vui lòng thử lại với cùng mã yêu cầu" });
  } else {
    console.error("API failure", error?.code ?? error?.name);
    res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Lỗi hệ thống" });
  }
};
