class RouteValidator {
  validateCreate(data) {
    const { origin, destination, distance, estimatedDuration, status = "ACTIVE" } = data;

    if (!origin || typeof origin !== "string" || !origin.trim()) {
      const error = new Error("Điểm xuất phát (origin) là bắt buộc và phải là chuỗi ký tự");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    if (!destination || typeof destination !== "string" || !destination.trim()) {
      const error = new Error("Điểm đến (destination) là bắt buộc và phải là chuỗi ký tự");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const numDistance = parseFloat(distance);
    if (isNaN(numDistance) || numDistance <= 0) {
      const error = new Error("Khoảng cách (distance) phải là số dương lớn hơn 0 (km)");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const numDuration = parseInt(estimatedDuration);
    if (isNaN(numDuration) || numDuration <= 0) {
      const error = new Error("Thời gian dự kiến (estimatedDuration) phải là số nguyên dương (phút)");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const cleanStatus = status.trim().toUpperCase();
    if (!["ACTIVE", "INACTIVE"].includes(cleanStatus)) {
      const error = new Error("Trạng thái (status) chỉ có thể là ACTIVE hoặc INACTIVE");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    return {
      origin: origin.trim(),
      destination: destination.trim(),
      distance: numDistance,
      estimated_duration: numDuration,
      status: cleanStatus,
    };
  }

  validateUpdate(data, existing) {
    const origin = data.origin !== undefined ? data.origin.trim() : existing.origin;
    const destination = data.destination !== undefined ? data.destination.trim() : existing.destination;

    if (!origin || !destination) {
      const error = new Error("Điểm xuất phát và điểm đến không được để trống");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    let numDistance = existing.distance;
    if (data.distance !== undefined) {
      numDistance = parseFloat(data.distance);
      if (isNaN(numDistance) || numDistance <= 0) {
        const error = new Error("Khoảng cách phải lớn hơn 0");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    let numDuration = existing.estimated_duration;
    if (data.estimatedDuration !== undefined) {
      numDuration = parseInt(data.estimatedDuration);
      if (isNaN(numDuration) || numDuration <= 0) {
        const error = new Error("Thời gian dự kiến phải lớn hơn 0");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    let status = existing.status;
    if (data.status !== undefined) {
      status = data.status.trim().toUpperCase();
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        const error = new Error("Trạng thái chỉ có thể là ACTIVE hoặc INACTIVE");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    return {
      origin,
      destination,
      distance: numDistance,
      estimated_duration: numDuration,
      status,
    };
  }

  validateStatus(status) {
    const cleanStatus = (status || "").trim().toUpperCase();
    if (!["ACTIVE", "INACTIVE"].includes(cleanStatus)) {
      const error = new Error("Trạng thái chỉ nhận ACTIVE hoặc INACTIVE");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }
    return cleanStatus;
  }
}

module.exports = new RouteValidator();
