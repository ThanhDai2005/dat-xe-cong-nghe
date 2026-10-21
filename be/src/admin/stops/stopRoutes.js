const express = require("express");
const router = express.Router();
const stopController = require("./stopController");

// Lấy danh sách điểm đón/trả (hỗ trợ tìm kiếm, lọc theo routeId, type, status, phân trang)
router.get("/", (req, res) => stopController.list(req, res));

// Lấy chi tiết điểm đón/trả theo id
router.get("/:id", (req, res) => stopController.getById(req, res));

// Thêm mới điểm đón/trả
router.post("/", (req, res) => stopController.create(req, res));

// Cập nhật điểm đón/trả
router.put("/:id", (req, res) => stopController.update(req, res));

// Cập nhật trạng thái (ACTIVE / INACTIVE)
router.patch("/:id/status", (req, res) => stopController.updateStatus(req, res));

// Xóa điểm đón/trả (mặc định xóa mềm, thêm ?hard=true để xóa cứng)
router.delete("/:id", (req, res) => stopController.remove(req, res));

module.exports = router;
