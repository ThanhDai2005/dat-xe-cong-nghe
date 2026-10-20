const vehicleService = require("./vehicleService");
const { sendSuccess, sendError } = require("../../utils/responseHelper");

class VehicleController {
  async list(req, res) {
    try {
      const result = await vehicleService.getAllVehicles(req.query);
      return sendSuccess(res, {
        message: "Lấy danh sách phương tiện thành công",
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
        message: error.message || "Lỗi khi lấy danh sách phương tiện",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getVehicleById(id);
      return sendSuccess(res, {
        message: "Lấy chi tiết phương tiện thành công",
        data: vehicle,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi lấy chi tiết phương tiện",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async create(req, res) {
    try {
      const newVehicle = await vehicleService.createVehicle(req.body);
      return sendSuccess(res, {
        message: "Thêm phương tiện mới thành công",
        data: newVehicle,
        statusCode: 201,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi thêm phương tiện",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedVehicle = await vehicleService.updateVehicle(id, req.body);
      return sendSuccess(res, {
        message: "Cập nhật phương tiện thành công",
        data: updatedVehicle,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi cập nhật phương tiện",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedVehicle = await vehicleService.updateStatus(id, status);
      return sendSuccess(res, {
        message: `Cập nhật trạng thái xe sang '${updatedVehicle.vehicle_status}' thành công`,
        data: updatedVehicle,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi cập nhật trạng thái xe",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;
      const isSoft = req.query.hard !== "true";
      const result = await vehicleService.deleteVehicle(id, isSoft);
      return sendSuccess(res, {
        message: result.message,
        data: { mode: result.mode },
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi xóa phương tiện",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }
}

module.exports = new VehicleController();
