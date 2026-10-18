const express = require("express");
const router = express.Router();
const routeController = require("./routeController");

// Lấy danh sách tuyến đường (có tìm kiếm, lọc status, phân trang)
router.get("/", (req, res) => routeController.list(req, res));

// Lấy chi tiết tuyến đường theo id (kèm danh sách điểm dừng)
router.get("/:id", (req, res) => routeController.getById(req, res));

// Thêm mới tuyến đường
router.post("/", (req, res) => routeController.create(req, res));

// Cập nhật thông tin tuyến đường
router.put("/:id", (req, res) => routeController.update(req, res));

// Cập nhật trạng thái tuyến đường (ACTIVE / INACTIVE)
router.patch("/:id/status", (req, res) => routeController.updateStatus(req, res));

// Xóa tuyến đường (Mặc định xóa mềm, thêm ?hard=true để xóa cứng nếu không có ràng buộc)
router.delete("/:id", (req, res) => routeController.remove(req, res));

module.exports = router;
