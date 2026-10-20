const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/adminMiddleware");

const routeRoutes = require("./routes/routeRoutes");
const stopRoutes = require("./stops/stopRoutes");
const vehicleRoutes = require("./vehicles/vehicleRoutes");
const commissionRoutes = require("./commissions/commissionRoutes");

// ══════════════════════════════════════════════════════════════════════════
// Bảo vệ toàn bộ endpoint Admin bằng xác thực Token + Phân quyền role ADMIN
// ══════════════════════════════════════════════════════════════════════════
router.use(requireAuth, requireAdmin);

// 1. Tuyến đường (Routes)
router.use("/routes", routeRoutes);

// 2. Điểm đón / Điểm dừng (Stops)
router.use("/stops", stopRoutes);

// 3. Phương tiện / Xe (Vehicles)
router.use("/vehicles", vehicleRoutes);

// 4. Chính sách hoa hồng (Commission Policies)
router.use("/commission-policies", commissionRoutes);
router.use("/commissions", commissionRoutes); // Alias linh hoạt

module.exports = router;
