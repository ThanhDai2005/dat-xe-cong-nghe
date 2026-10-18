const commissionRepository = require("./commissionRepository");
const commissionValidator = require("./commissionValidator");

class CommissionService {
  async getAllPolicies(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const isActive = query.isActive !== undefined ? query.isActive : query.is_active;

    return await commissionRepository.findAll({ page, limit, isActive });
  }

  async getPolicyById(id) {
    const policy = await commissionRepository.findById(id);
    if (!policy) {
      const error = new Error("Không tìm thấy chính sách hoa hồng");
      error.statusCode = 404;
      error.code = "POLICY_NOT_FOUND";
      throw error;
    }
    return policy;
  }

  async getActivePolicy() {
    const policy = await commissionRepository.findActivePolicy();
    if (!policy) {
      const error = new Error("Hiện tại không có chính sách hoa hồng nào đang kích hoạt");
      error.statusCode = 404;
      error.code = "NO_ACTIVE_POLICY";
      throw error;
    }
    return policy;
  }

  async createPolicy(data) {
    const validatedData = commissionValidator.validateCreate(data);

    if (validatedData.is_active) {
      await commissionRepository.deactivateAll();
    }

    const insertedId = await commissionRepository.create(validatedData);
    return await commissionRepository.findById(insertedId);
  }

  async updatePolicy(id, data) {
    const existing = await commissionRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy chính sách hoa hồng để cập nhật");
      error.statusCode = 404;
      error.code = "POLICY_NOT_FOUND";
      throw error;
    }

    const validatedData = commissionValidator.validateUpdate(data, existing);

    if (validatedData.is_active && !existing.is_active) {
      await commissionRepository.deactivateAll();
    }

    await commissionRepository.update(id, validatedData);
    return await commissionRepository.findById(id);
  }

  async updateStatus(id, rawActive) {
    const isActive = commissionValidator.validateStatus(rawActive);

    const existing = await commissionRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy chính sách hoa hồng");
      error.statusCode = 404;
      error.code = "POLICY_NOT_FOUND";
      throw error;
    }

    if (isActive) {
      await commissionRepository.deactivateAll();
    }

    await commissionRepository.updateStatus(id, isActive);
    return await commissionRepository.findById(id);
  }

  async deletePolicy(id, softDelete = true) {
    const existing = await commissionRepository.findById(id);
    if (!existing) {
      const error = new Error("Không tìm thấy chính sách hoa hồng");
      error.statusCode = 404;
      error.code = "POLICY_NOT_FOUND";
      throw error;
    }

    if (softDelete) {
      await commissionRepository.updateStatus(id, false);
      return {
        mode: "SOFT_DELETE",
        message: "Đã vô hiệu hóa chính sách hoa hồng (is_active = false)",
      };
    }

    const bookingCount = await commissionRepository.countBookingsByPolicyId(id);
    if (bookingCount > 0) {
      const error = new Error(`Không thể xóa cứng chính sách này vì đã được áp dụng cho ${bookingCount} đơn đặt chuyến. Hãy dùng xóa mềm.`);
      error.statusCode = 400;
      error.code = "FOREIGN_KEY_CONFLICT";
      throw error;
    }

    await commissionRepository.deleteById(id);
    return {
      mode: "HARD_DELETE",
      message: "Đã xóa chính sách hoa hồng khỏi hệ thống thành công",
    };
  }
}

module.exports = new CommissionService();
