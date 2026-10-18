const stopService = require("./stopService");
const { sendSuccess, sendError } = require("../../utils/responseHelper");

class StopController {
  async list(req, res) {
    try {
      const result = await stopService.getAllStops(req.query);
      return sendSuccess(res, {
        message: "Lấy danh sách điểm đón/trả thành công",
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
        message: error.message || "Lỗi khi lấy danh sách điểm đón/trả",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const stop = await stopService.getStopById(id);
      return sendSuccess(res, {
        message: "Lấy chi tiết điểm đón/trả thành công",
        data: stop,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi lấy chi tiết điểm đón/trả",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async create(req, res) {
    try {
      const newStop = await stopService.createStop(req.body);
      return sendSuccess(res, {
        message: "Thêm điểm đón/trả thành công",
        data: newStop,
        statusCode: 201,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi thêm điểm đón/trả",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedStop = await stopService.updateStop(id, req.body);
      return sendSuccess(res, {
        message: "Cập nhật điểm đón/trả thành công",
        data: updatedStop,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi cập nhật điểm đón/trả",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedStop = await stopService.updateStatus(id, status);
      return sendSuccess(res, {
        message: `Cập nhật trạng thái điểm dừng sang '${updatedStop.status}' thành công`,
        data: updatedStop,
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
      const result = await stopService.deleteStop(id, isSoft);
      return sendSuccess(res, {
        message: result.message,
        data: { mode: result.mode },
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi xóa điểm đón/trả",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }
}

module.exports = new StopController();
