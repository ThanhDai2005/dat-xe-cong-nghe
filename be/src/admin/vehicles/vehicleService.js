const vehicleRepository = require("./vehicleRepository");
const vehicleValidator = require("./vehicleValidator");

class VehicleService {
  async getAllVehicles(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const search = query.search || "";
    const status = query.status || query.vehicleStatus || "";
    const seatCount = query.seatCount || query.totalSeats || null;

    return await vehicleRepository.findAll({ page, limit, search, status, seatCount });
  }

  async getVehicleById(id) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      const error = new Error("Không tìm thấy phương tiện");
      error.statusCode = 404;
      error.code = "VEHICLE_NOT_FOUND";
      throw error;
    }
    return vehicle;
  }

  async createVehicle(data) {
    const validatedData = vehicleValidator.validateCreate(data);

    // Kiểm tra trùng biển số xe
    const existing = await vehicleRepository.findByLicensePlate(validatedData.license_plate);
    if (existing) {
      const error = new Error(`Phương tiện với biển số '${validatedData.license_plate}' đã tồn tại trong hệ thống`);
      error.statusCode = 409;
      error.code = "LICENSE_PLATE_ALREADY_EXISTS";
      throw error;
    }

    const insertedId = await vehicleRepository.create(validatedData);
    return await vehicleRepository.findById(insertedId);
  }

  async updateVehicle(id, data) {
    const existing = await vehicleRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy phương tiện để cập nhật");
      error.statusCode = 404;
      error.code = "VEHICLE_NOT_FOUND";
      throw error;
    }

    const validatedData = vehicleValidator.validateUpdate(data, existing);

    // Kiểm tra trùng biển số nếu đổi biển
    if (validatedData.license_plate !== existing.license_plate) {
      const duplicate = await vehicleRepository.findByLicensePlate(validatedData.license_plate, id);
      if (duplicate) {
        const error = new Error(`Phương tiện với biển số '${validatedData.license_plate}' đã tồn tại`);
        error.statusCode = 409;
        error.code = "LICENSE_PLATE_ALREADY_EXISTS";
        throw error;
      }
    }

    await vehicleRepository.update(id, validatedData);
    return await vehicleRepository.findById(id);
  }

  async updateStatus(id, rawStatus) {
    const cleanStatus = vehicleValidator.validateStatus(rawStatus);

    const existing = await vehicleRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy phương tiện");
      error.statusCode = 404;
      error.code = "VEHICLE_NOT_FOUND";
      throw error;
    }

    await vehicleRepository.updateStatus(id, cleanStatus);
    return await vehicleRepository.findById(id);
  }

  async deleteVehicle(id, softDelete = true) {
    const existing = await vehicleRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy phương tiện");
      error.statusCode = 404;
      error.code = "VEHICLE_NOT_FOUND";
      throw error;
    }

    // Kiểm tra xe có đang được gán cho tài xế nào không
    const assignedDriver = await vehicleRepository.checkDriverAssignment(id);

    if (softDelete) {
      await vehicleRepository.updateStatus(id, "INACTIVE");
      return {
        mode: "SOFT_DELETE",
        message: "Đã vô hiệu hóa xe thành công (chuyển sang INACTIVE)",
      };
    }

    // Xóa cứng
    if (assignedDriver) {
      const error = new Error(`Không thể xóa xe vì đang được gán cho tài xế '${assignedDriver.full_name}' (SĐT: ${assignedDriver.phone}). Hãy hủy gán xe trước.`);
      error.statusCode = 400;
      error.code = "FOREIGN_KEY_CONFLICT";
      throw error;
    }

    await vehicleRepository.deleteById(id);
    return {
      mode: "HARD_DELETE",
      message: "Đã xóa xe khỏi hệ thống thành công",
    };
  }
}

module.exports = new VehicleService();
