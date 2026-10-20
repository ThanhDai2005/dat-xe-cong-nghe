const express = require("express");
const { requireAuth } = require("../middlewares/authMiddleware");
const { createHttpError } = require("../customer/bookingValidation");
const service = require("./adminService");

const router = express.Router();

const requireAdmin = async (req, res, next) => {
  try {
    if (req.user?.role !== "ADMIN" || req.user?.status !== "ACTIVE") {
      throw createHttpError(403, "ADMIN_REQUIRED", "Chỉ Admin đang hoạt động được truy cập");
    }
    const database = require("../database");
    const [rows] = await database.query(
      "SELECT role, status FROM users WHERE id = ? LIMIT 1", [req.user.sub],
    );
    if (rows[0]?.role !== "ADMIN" || rows[0]?.status !== "ACTIVE") {
      throw createHttpError(403, "ADMIN_REQUIRED", "Tài khoản Admin không còn hoạt động");
    }
    next();
  } catch (error) {
    next(error);
  }
};

const handle = (fn, status = 200, message = "Thành công") => async (req, res, next) => {
  try {
    const data = await fn(req);
    res.status(status).json({ success: true, message, data: data ?? null });
  } catch (error) {
    next(error);
  }
};

router.use(requireAuth, requireAdmin);
router.get("/routes", handle(() => service.listRoutes()));
router.get("/vehicles", handle(() => service.listVehicles()));
router.get("/booking-types", handle(() => service.listBookingTypes()));
router.get("/vehicle-types", handle(() => service.listVehicleTypes()));
router.post("/vehicle-types", handle((req) => service.createVehicleType(req.body), 201, "Đã thêm loại xe"));
router.patch("/vehicles/:id/type", handle((req) => service.assignVehicleType(req.params.id, req.body), 200, "Đã gán loại xe"));
router.get("/fares", handle((req) => service.listFares(req.query)));
router.post("/fares", handle((req) => service.createFare(req.body), 201, "Đã thêm giá vé"));
router.put("/fares/:id", handle((req) => service.updateFare(req.params.id, req.body), 200, "Đã cập nhật giá vé"));
router.delete("/fares/:id", handle((req) => service.deleteFare(req.params.id), 200, "Đã ngừng áp dụng giá vé"));
router.get("/trips", handle((req) => service.listTrips(req.query)));
router.post("/trips", handle((req) => service.createTrip(req.body), 201, "Đã lên lịch chuyến xe"));
router.put("/trips/:id", handle((req) => service.updateTrip(req.params.id, req.body), 200, "Đã cập nhật chuyến xe"));
router.patch("/trips/:id/status", handle((req) => service.updateTripStatus(req.params.id, req.body), 200, "Đã cập nhật trạng thái chuyến"));

module.exports = router;
