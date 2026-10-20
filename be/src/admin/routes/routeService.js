const routeRepository = require("./routeRepository");
const routeValidator = require("./routeValidator");
const { db } = require("../../database");

class RouteService {
  async getAllRoutes(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const search = query.search || "";
    const status = query.status || "";

    return await routeRepository.findAll({ page, limit, search, status });
  }

  async getRouteById(id) {
    const route = await routeRepository.findById(id);
    if (!route) {
      const error = new Error("Không tìm thấy tuyến đường");
      error.statusCode = 404;
      error.code = "ROUTE_NOT_FOUND";
      throw error;
    }

    // Lấy kèm danh sách các điểm dừng thuộc tuyến đường này
    const [stops] = await db.query(
      `SELECT id, route_id, stop_name, address, type, stop_order, status, created_at, updated_at
       FROM stops
       WHERE route_id = ?
       ORDER BY stop_order ASC, id ASC`,
      [id]
    );

    return {
      ...route,
      stops,
    };
  }

  async createRoute(data) {
    const validatedData = routeValidator.validateCreate(data);

    // Kiểm tra trùng lặp tuyến
    const existing = await routeRepository.findByOriginAndDestination(
      validatedData.origin,
      validatedData.destination
    );
    if (existing) {
      const error = new Error(`Tuyến đường từ '${validatedData.origin}' đến '${validatedData.destination}' đã tồn tại`);
      error.statusCode = 409;
      error.code = "ROUTE_ALREADY_EXISTS";
      throw error;
    }

    const insertedId = await routeRepository.create(validatedData);
    return await routeRepository.findById(insertedId);
  }

  async updateRoute(id, data) {
    const existing = await routeRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy tuyến đường để cập nhật");
      error.statusCode = 404;
      error.code = "ROUTE_NOT_FOUND";
      throw error;
    }

    const validatedData = routeValidator.validateUpdate(data, existing);

    // Kiểm tra trùng lặp nếu đổi origin hoặc destination
    if (
      validatedData.origin.toLowerCase() !== existing.origin.toLowerCase() ||
      validatedData.destination.toLowerCase() !== existing.destination.toLowerCase()
    ) {
      const duplicate = await routeRepository.findByOriginAndDestination(
        validatedData.origin,
        validatedData.destination,
        id
      );
      if (duplicate) {
        const error = new Error(`Tuyến đường từ '${validatedData.origin}' đến '${validatedData.destination}' đã tồn tại`);
        error.statusCode = 409;
        error.code = "ROUTE_ALREADY_EXISTS";
        throw error;
      }
    }

    await routeRepository.update(id, validatedData);
    return await routeRepository.findById(id);
  }

  async updateStatus(id, rawStatus) {
    const cleanStatus = routeValidator.validateStatus(rawStatus);

    const existing = await routeRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy tuyến đường");
      error.statusCode = 404;
      error.code = "ROUTE_NOT_FOUND";
      throw error;
    }

    await routeRepository.updateStatus(id, cleanStatus);
    return await routeRepository.findById(id);
  }

  async deleteRoute(id, softDelete = true) {
    const existing = await routeRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy tuyến đường");
      error.statusCode = 404;
      error.code = "ROUTE_NOT_FOUND";
      throw error;
    }

    const stopsCount = await routeRepository.countStopsByRouteId(id);

    if (softDelete) {
      await routeRepository.updateStatus(id, "INACTIVE");
      return {
        mode: "SOFT_DELETE",
        message: "Đã vô hiệu hóa tuyến đường thành công (chuyển sang INACTIVE)",
      };
    }

    if (stopsCount > 0) {
      const error = new Error(`Không thể xóa tuyến đường vì đang có ${stopsCount} điểm dừng trực thuộc. Hãy xóa các điểm dừng trước hoặc dùng xóa mềm.`);
      error.statusCode = 400;
      error.code = "FOREIGN_KEY_CONFLICT";
      throw error;
    }

    await routeRepository.deleteById(id);
    return {
      mode: "HARD_DELETE",
      message: "Đã xóa hoàn toàn tuyến đường khỏi hệ thống",
    };
  }
}

module.exports = new RouteService();
