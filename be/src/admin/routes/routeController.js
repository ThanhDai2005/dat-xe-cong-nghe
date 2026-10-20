const routeService = require("./routeService");
const { sendSuccess, sendError } = require("../../utils/responseHelper");

class RouteController {
  async list(req, res) {
    try {
      const result = await routeService.getAllRoutes(req.query);
      return sendSuccess(res, {
        message: "Lấy danh sách tuyến đường thành công",
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
        message: error.message || "Lỗi khi lấy danh sách tuyến đường",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const route = await routeService.getRouteById(id);
      return sendSuccess(res, {
        message: "Lấy chi tiết tuyến đường thành công",
        data: route,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi lấy chi tiết tuyến đường",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async create(req, res) {
    try {
      const newRoute = await routeService.createRoute(req.body);
      return sendSuccess(res, {
        message: "Thêm tuyến đường mới thành công",
        data: newRoute,
        statusCode: 201,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi thêm tuyến đường",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedRoute = await routeService.updateRoute(id, req.body);
      return sendSuccess(res, {
        message: "Cập nhật tuyến đường thành công",
        data: updatedRoute,
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi cập nhật tuyến đường",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedRoute = await routeService.updateStatus(id, status);
      return sendSuccess(res, {
        message: `Cập nhật trạng thái tuyến đường sang '${updatedRoute.status}' thành công`,
        data: updatedRoute,
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
      const result = await routeService.deleteRoute(id, isSoft);
      return sendSuccess(res, {
        message: result.message,
        data: { mode: result.mode },
      });
    } catch (error) {
      return sendError(res, {
        message: error.message || "Lỗi khi xóa tuyến đường",
        code: error.code || "INTERNAL_ERROR",
        statusCode: error.statusCode || 500,
      });
    }
  }
}

module.exports = new RouteController();
