const express = require("express");
const router = express.Router();
const commissionController = require("./commissionController");

// Lấy danh sách chính sách hoa hồng (phân trang, lọc isActive)
router.get("/", (req, res) => commissionController.list(req, res));

// Lấy chính sách hoa hồng hiện tại đang kích hoạt
router.get("/active", (req, res) => commissionController.getActive(req, res));

// Lấy chi tiết chính sách theo id
router.get("/:id", (req, res) => commissionController.getById(req, res));

// Thêm mới chính sách hoa hồng
router.post("/", (req, res) => commissionController.create(req, res));

// Cập nhật chính sách hoa hồng
router.put("/:id", (req, res) => commissionController.update(req, res));

// Cập nhật trạng thái kích hoạt (is_active)
router.patch("/:id/status", (req, res) => commissionController.updateStatus(req, res));

// Xóa chính sách hoa hồng (mặc định xóa mềm is_active=0, thêm ?hard=true để xóa cứng nếu chưa có booking)
router.delete("/:id", (req, res) => commissionController.remove(req, res));

module.exports = router;
