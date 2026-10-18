class CommissionValidator {
  validateCreate(data) {
    const rawBase = data.baseDriverRate !== undefined ? data.baseDriverRate : data.base_driver_rate;
    const rawIncrease =
      data.increasePerCompletedTrip !== undefined ? data.increasePerCompletedTrip : data.increase_per_completed_trip;
    const rawMax = data.maximumDriverRate !== undefined ? data.maximumDriverRate : data.maximum_driver_rate;
    const effectiveFrom = data.effectiveFrom || data.effective_from || new Date();
    const isActive = data.isActive !== undefined ? !!data.isActive : data.is_active !== undefined ? !!data.is_active : true;

    const baseRate = parseFloat(rawBase);
    const increaseRate = parseFloat(rawIncrease);
    const maxRate = parseFloat(rawMax);

    if (isNaN(baseRate) || baseRate <= 0 || baseRate > 1.0) {
      const error = new Error("Tỷ lệ cơ bản (baseDriverRate) phải trong khoảng từ > 0 đến 1.0 (ví dụ: 0.7000 = 70%)");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    if (isNaN(increaseRate) || increaseRate < 0) {
      const error = new Error("Tỷ lệ tăng mỗi chuyến (increasePerCompletedTrip) phải >= 0 (ví dụ: 0.0100 = 1%)");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    if (isNaN(maxRate) || maxRate > 1.0 || maxRate < baseRate) {
      const error = new Error("Tỷ lệ tối đa (maximumDriverRate) phải <= 1.0 và lớn hơn hoặc bằng tỷ lệ cơ bản");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    return {
      base_driver_rate: baseRate,
      increase_per_completed_trip: increaseRate,
      maximum_driver_rate: maxRate,
      effective_from: effectiveFrom,
      is_active: isActive,
    };
  }

  validateUpdate(data, existing) {
    let baseRate = parseFloat(existing.base_driver_rate);
    if (data.baseDriverRate !== undefined || data.base_driver_rate !== undefined) {
      baseRate = parseFloat(data.baseDriverRate !== undefined ? data.baseDriverRate : data.base_driver_rate);
      if (isNaN(baseRate) || baseRate <= 0 || baseRate > 1.0) {
        const error = new Error("Tỷ lệ cơ bản (baseDriverRate) phải trong khoảng (0, 1.0]");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    let increaseRate = parseFloat(existing.increase_per_completed_trip);
    if (data.increasePerCompletedTrip !== undefined || data.increase_per_completed_trip !== undefined) {
      increaseRate = parseFloat(
        data.increasePerCompletedTrip !== undefined ? data.increasePerCompletedTrip : data.increase_per_completed_trip
      );
      if (isNaN(increaseRate) || increaseRate < 0) {
        const error = new Error("Tỷ lệ tăng mỗi chuyến phải >= 0");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    let maxRate = parseFloat(existing.maximum_driver_rate);
    if (data.maximumDriverRate !== undefined || data.maximum_driver_rate !== undefined) {
      maxRate = parseFloat(data.maximumDriverRate !== undefined ? data.maximumDriverRate : data.maximum_driver_rate);
      if (isNaN(maxRate) || maxRate > 1.0 || maxRate < baseRate) {
        const error = new Error("Tỷ lệ tối đa phải <= 1.0 và lớn hơn hoặc bằng tỷ lệ cơ bản");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    let effectiveFrom = existing.effective_from;
    if (data.effectiveFrom || data.effective_from) {
      effectiveFrom = data.effectiveFrom || data.effective_from;
    }

    let isActive = existing.is_active;
    if (data.isActive !== undefined || data.is_active !== undefined) {
      isActive = data.isActive !== undefined ? !!data.isActive : !!data.is_active;
    }

    return {
      base_driver_rate: baseRate,
      increase_per_completed_trip: increaseRate,
      maximum_driver_rate: maxRate,
      effective_from: effectiveFrom,
      is_active: isActive,
    };
  }

  validateStatus(rawActive) {
    return rawActive === true || rawActive === "true" || rawActive === 1 || rawActive === "1";
  }
}

module.exports = new CommissionValidator();
