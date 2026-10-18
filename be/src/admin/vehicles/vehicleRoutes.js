const express = require("express");
const router = express.Router();
const vehicleController = require("./vehicleController");

// Lấy danh sách xe (hỗ trợ tìm biển số, lọc trạng thái, lọc số chỗ, phân trang)
router.get("/", (req, res) => vehicleController.list(req, res));

// Lấy thông tin chi tiết xe theo id
router.get("/:id", (req, res) => vehicleController.getById(req, res));

// Thêm phương tiện mới
router.post("/", (req, res) => vehicleController.create(req, res));

// Cập nhật thông tin xe
router.put("/:id", (req, res) => vehicleController.update(req, res));

// Cập nhật trạng thái xe (ACTIVE / MAINTENANCE / INACTIVE)
router.patch("/:id/status", (req, res) => vehicleController.updateStatus(req, res));

// Xóa xe (mặc định xóa mềm, thêm ?hard=true để xóa cứng khi chưa gán tài xế)
router.delete("/:id", (req, res) => vehicleController.remove(req, res));

module.exports = router;
