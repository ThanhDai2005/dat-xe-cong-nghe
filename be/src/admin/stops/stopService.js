const stopRepository = require("./stopRepository");
const stopValidator = require("./stopValidator");
const routeRepository = require("../routes/routeRepository");

class StopService {
  async getAllStops(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const search = query.search || "";
    const routeId = query.routeId ? parseInt(query.routeId) : null;
    const type = query.type || "";
    const status = query.status || "";

    return await stopRepository.findAll({ page, limit, search, routeId, type, status });
  }

  async getStopById(id) {
    const stop = await stopRepository.findById(id);
    if (!stop) {
      const error = new Error("Không tìm thấy điểm dừng");
      error.statusCode = 404;
      error.code = "STOP_NOT_FOUND";
      throw error;
    }
    return stop;
  }

  async createStop(data) {
    const validatedData = stopValidator.validateCreate(data);

    // Kiểm tra tuyến đường tồn tại
    const route = await routeRepository.findById(validatedData.route_id);
    if (!route) {
      const error = new Error(`Tuyến đường với ID ${validatedData.route_id} không tồn tại`);
      error.statusCode = 404;
      error.code = "ROUTE_NOT_FOUND";
      throw error;
    }

    // Kiểm tra trùng tên điểm dừng trên cùng 1 tuyến
    const duplicate = await stopRepository.findByRouteAndName(
      validatedData.route_id,
      validatedData.stop_name
    );
    if (duplicate) {
      const error = new Error(`Điểm dừng '${validatedData.stop_name}' đã tồn tại trên tuyến này`);
      error.statusCode = 409;
      error.code = "STOP_ALREADY_EXISTS";
      throw error;
    }

    const insertedId = await stopRepository.create(validatedData);
    return await stopRepository.findById(insertedId);
  }

  async updateStop(id, data) {
    const existing = await stopRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy điểm dừng để cập nhật");
      error.statusCode = 404;
      error.code = "STOP_NOT_FOUND";
      throw error;
    }

    const validatedData = stopValidator.validateUpdate(data, existing);

    // Kiểm tra tuyến đường nếu đổi route_id
    if (validatedData.route_id !== existing.route_id) {
      const route = await routeRepository.findById(validatedData.route_id);
      if (!route) {
        const error = new Error(`Tuyến đường với ID ${validatedData.route_id} không tồn tại`);
        error.statusCode = 404;
        error.code = "ROUTE_NOT_FOUND";
        throw error;
      }
    }

    // Kiểm tra trùng tên điểm dừng trên tuyến
    if (
      validatedData.stop_name.toLowerCase() !== existing.stop_name.toLowerCase() ||
      validatedData.route_id !== existing.route_id
    ) {
      const duplicate = await stopRepository.findByRouteAndName(
        validatedData.route_id,
        validatedData.stop_name,
        id
      );
      if (duplicate) {
        const error = new Error(`Điểm dừng '${validatedData.stop_name}' đã tồn tại trên tuyến này`);
        error.statusCode = 409;
        error.code = "STOP_ALREADY_EXISTS";
        throw error;
      }
    }

    await stopRepository.update(id, validatedData);
    return await stopRepository.findById(id);
  }

  async updateStatus(id, rawStatus) {
    const cleanStatus = stopValidator.validateStatus(rawStatus);

    const existing = await stopRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy điểm dừng");
      error.statusCode = 404;
      error.code = "STOP_NOT_FOUND";
      throw error;
    }

    await stopRepository.updateStatus(id, cleanStatus);
    return await stopRepository.findById(id);
  }

  async deleteStop(id, softDelete = true) {
    const existing = await stopRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy điểm dừng");
      error.statusCode = 404;
      error.code = "STOP_NOT_FOUND";
      throw error;
    }

    if (softDelete) {
      await stopRepository.updateStatus(id, "INACTIVE");
      return {
        mode: "SOFT_DELETE",
        message: "Đã vô hiệu hóa điểm dừng thành công (chuyển sang INACTIVE)",
      };
    }

    await stopRepository.deleteById(id);
    return {
      mode: "HARD_DELETE",
      message: "Đã xóa hoàn toàn điểm dừng khỏi hệ thống",
    };
  }
}

module.exports = new StopService();
