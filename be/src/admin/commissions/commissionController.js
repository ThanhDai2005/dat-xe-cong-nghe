const commissionService = require("./commissionService");
const { sendSuccess, sendError } = require("../../utils/responseHelper");

class CommissionController {
  async list(req, res) {
    try {
      const result = await commissionService.getAllPolicies(req.query);
      return sendSuccess(res, {
        message: "Lấy danh sách chính sách hoa hồng thành công",
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi lấy danh sách chính sách",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async getActive(req, res) {
    try {
      const policy = await commissionService.getActivePolicy();
      return sendSuccess(res, {
        message: "Lấy chính sách hoa hồng đang áp dụng thành công",
        data: policy,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi lấy chính sách đang áp dụng",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const policy = await commissionService.getPolicyById(id);
      return sendSuccess(res, {
        message: "Lấy chi tiết chính sách hoa hồng thành công",
        data: policy,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi lấy chi tiết chính sách",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async create(req, res) {
    try {
      const newPolicy = await commissionService.createPolicy(req.body);
      return sendSuccess(res, {
        message: "Thêm chính sách hoa hồng mới thành công",
        data: newPolicy,
        statusCode: 201,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi tạo chính sách hoa hồng",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedPolicy = await commissionService.updatePolicy(id, req.body);
      return sendSuccess(res, {
        message: "Cập nhật chính sách hoa hồng thành công",
        data: updatedPolicy,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi cập nhật chính sách",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive, is_active } = req.body;
      const activeVal = isActive !== undefined ? isActive : is_active;
      const updatedPolicy = await commissionService.updateStatus(id, activeVal);
      return sendSuccess(res, {
        message: `Cập nhật trạng thái chính sách thành ${updatedPolicy.is_active ? "Hoạt động" : "Ngừng hoạt động"} thành công`,
        data: updatedPolicy,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi cập nhật trạng thái",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;
      const isSoft = req.query.hard !== "true";
      const result = await commissionService.deletePolicy(id, isSoft);
      return sendSuccess(res, {
        message: result.message,
        data: { mode: result.mode },
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi xóa chính sách",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }
}

module.exports = new CommissionController();
