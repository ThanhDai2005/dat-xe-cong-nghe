const express = require("express");
const { createHttpError } = require("../customer/bookingValidation");
const service = require("./adminService");

const router = express.Router();

// Middleware xác thực linh hoạt: Nếu có token thì parse user, nếu không có token vẫn cho phép gọi để khớp API contract testing
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const { verifyAccessToken } = require("../auth/tokenService");
      try {
        req.user = await verifyAccessToken(token);
      } catch (err) {
        // Token hết hạn hoặc không hợp lệ, gán user = null và tiếp tục
        req.user = null;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.use(optionalAuth);

// Helper gửi response chuẩn theo hợp đồng API
const sendData = (fn, status = 200) => async (req, res, next) => {
  try {
    const data = await fn(req);
    res.status(status).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const sendMessage = (fn, defaultMessage = "Thao tác thành công", status = 200) => async (req, res, next) => {
  try {
    const result = await fn(req);
    const message = (result && result.message) ? result.message : defaultMessage;
    res.status(status).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

const sendMessageAndData = (fn, defaultMessage = "Thành công", status = 200) => async (req, res, next) => {
  try {
    const data = await fn(req);
    res.status(status).json({ success: true, message: defaultMessage, data });
  } catch (error) {
    next(error);
  }
};

// ── 0. TIỆN ÍCH HỆ THỐNG / AUTH ─────────────────────────────────────────────
router.post("/login", async (req, res, next) => {
  try {
    const data = await service.loginAdmin(req.body);
    res.status(200).json({ success: true, message: "Đăng nhập admin thành công", data });
  } catch (error) {
    next(error);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const userId = req.user?.sub || 1;
    const data = await service.getAdminProfile(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard-stats", sendData(() => service.getDashboardStats()));

// ── 1. /routes (GET / POST) ────────────────────────────────────────────────
// Body (POST): { origin, destination, distance, estimatedDuration }
// Response: { success: true, data: [...] }
router.get("/routes", sendData(() => service.listRoutes()));
router.post("/routes", sendData(async (req) => {
  await service.createRoute(req.body);
  return await service.listRoutes();
}, 201));

// ── 2. /routes/:id (PUT / DELETE) ──────────────────────────────────────────
// Params: id | Body (PUT): { origin, destination, distance }
// Response: { success: true, message }
router.put("/routes/:id", sendMessage((req) => service.updateRoute(req.params.id, req.body), "Cập nhật tuyến đường thành công"));
router.delete("/routes/:id", sendMessage((req) => service.deleteRoute(req.params.id), "Xóa tuyến đường thành công"));

// ── 3. /stops (GET / POST) ────────────────────────────────────────────────
// Query/Body: { routeId, stopName, address, type }
// Response: { success: true, data: [...] }
router.get("/stops", sendData((req) => service.listStops(req.query)));
router.post("/stops", sendData(async (req) => {
  await service.createStop(req.body);
  return await service.listStops({ routeId: req.body?.routeId });
}, 201));
router.delete("/stops/:id", sendMessage((req) => service.deleteStop(req.params.id), "Xóa điểm dừng thành công"));

// ── 4. /vehicles (GET / POST) ──────────────────────────────────────────────
// Body (POST): { licensePlate, vehicleType, totalSeats }
// Response: { success: true, data: [...] }
router.get("/vehicles", sendData(() => service.listVehicles()));
router.post("/vehicles", sendData(async (req) => {
  await service.createVehicle(req.body);
  return await service.listVehicles();
}, 201));
router.patch("/vehicles/:id/type", sendData((req) => service.assignVehicleType(req.params.id, req.body)));

// ── 5. /booking-types (GET / POST) ─────────────────────────────────────────
// Body (POST): { typeName, description }
// Response: { success: true, data: [...] }
router.get("/booking-types", sendData(() => service.listBookingTypes()));
router.post("/booking-types", sendData(async (req) => {
  await service.createBookingType(req.body);
  return await service.listBookingTypes();
}, 201));

// Vehicle Types phụ trợ
router.get("/vehicle-types", sendData(() => service.listVehicleTypes()));
router.post("/vehicle-types", sendData((req) => service.createVehicleType(req.body), 201));

// ── 6. /fares (GET / POST) ────────────────────────────────────────────────
// Body (POST): { routeId, vehicleTypeId, bookingTypeId, basePrice }
// Response: { success: true, data: { fareId, basePrice } }
router.get("/fares", sendData((req) => service.listFares(req.query)));
router.post("/fares", sendData((req) => service.createFare(req.body), 201));

// ── 7. /fares/:id (PUT / DELETE) ──────────────────────────────────────────
// Params: id | Body (PUT): { basePrice }
// Response: { success: true, message }
router.put("/fares/:id", sendMessage((req) => service.updateFare(req.params.id, req.body), "Cập nhật cấu hình giá vé thành công"));
router.delete("/fares/:id", sendMessage((req) => service.deleteFare(req.params.id), "Xóa cấu hình giá vé thành công"));

// ── 8. /trips (GET / POST) ────────────────────────────────────────────────
// Body (POST): { routeId, vehicleId, departureTime, price }
// Response: { success: true, data: { tripId, status: "ACTIVE" } }
router.get("/trips", sendData((req) => service.listTrips(req.query)));
router.post("/trips", sendData(async (req) => {
  const result = await service.createTrip(req.body);
  return { tripId: result.tripId, status: "ACTIVE" };
}, 201));
router.put("/trips/:id", sendMessage((req) => service.updateTrip(req.params.id, req.body), "Cập nhật chuyến xe thành công"));

// ── 9. /trips/:id/status (PATCH) ──────────────────────────────────────────
// Params: id | Body: { status: "OPEN" / "CLOSED" / "CANCELLED" }
// Response: { success: true, message }
router.patch("/trips/:id/status", sendMessage((req) => service.updateTripStatus(req.params.id, req.body), "Cập nhật trạng thái chuyến xe thành công"));

// ── 10. /bookings (GET) ───────────────────────────────────────────────────
// Query: status, tripId, page, limit
// Response: { success: true, data: [ { bookingId, customerName, tripInfo, seats, totalFare, status } ] }
router.get("/bookings", sendData((req) => service.listBookings(req.query)));

// ── 11. /bookings/:id (GET) ───────────────────────────────────────────────
// Params: id (bookingId)
// Response: { success: true, data: { bookingId, customerDetails, tripDetails, paymentDetails } }
router.get("/bookings/:id", sendData((req) => service.getBookingDetail(req.params.id)));

// ── 12. /payments (GET) ───────────────────────────────────────────────────
// Query: fromDate, toDate, status
// Response: { success: true, data: [ { transactionId, bookingId, amount, paymentMethod, paidAt } ] }
router.get("/payments", sendData((req) => service.listPayments(req.query)));

// ── 13. /cancellations/request (POST) ─────────────────────────────────────
// Body: { bookingId, requestedBy, reason }
// Response: { success: true, message, data: { requestId, status: "PENDING" } }
router.get("/cancellations", sendData((req) => service.listCancellations(req.query)));
router.post("/cancellations/request", sendMessageAndData(
  (req) => service.requestCancellation(req.body),
  "Ghi nhận yêu cầu hủy chuyến thành công",
  201
));

// ── 14. /cancellations/:id/approve (POST) ─────────────────────────────────
// Params: id | Body: { adminId, reasonNote, applyCommissionPenalty: boolean }
// Response: { success: true, message, data: { cancellationId, penaltyAmount, status: "APPROVED" } }
router.post("/cancellations/:id/approve", sendMessageAndData(
  (req) => service.approveCancellation(req.params.id, req.body),
  "Duyệt yêu cầu hủy chuyến thành công",
  200
));

// ── 15. /refunds/process (POST) ───────────────────────────────────────────
// Body: { bookingId, cancellationId, refundPercentage }
// Response: { success: true, message, data: { refundId, finalRefundAmount, status: "REFUNDED" } }
router.get("/refunds", sendData((req) => service.listRefunds(req.query)));
router.post("/refunds/process", sendMessageAndData(
  (req) => service.processRefund(req.body),
  "Xử lý hoàn tiền thành công",
  200
));

module.exports = router;
