class StopValidator {
  validateCreate(data) {
    const { routeId, stopName, address, type = "BOTH", stopOrder = 1, status = "ACTIVE" } = data;

    const parsedRouteId = parseInt(routeId);
    if (!parsedRouteId || isNaN(parsedRouteId) || parsedRouteId <= 0) {
      const error = new Error("Mã tuyến đường (routeId) là bắt buộc và phải là số nguyên dương");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    if (!stopName || typeof stopName !== "string" || !stopName.trim()) {
      const error = new Error("Tên điểm dừng (stopName) không được để trống");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      const error = new Error("Địa chỉ điểm dừng (address) không được để trống");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const cleanType = (type || "BOTH").trim().toUpperCase();
    if (!["PICKUP", "DROPOFF", "BOTH"].includes(cleanType)) {
      const error = new Error("Loại điểm dừng (type) chỉ chấp nhận: PICKUP, DROPOFF hoặc BOTH");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const cleanStatus = (status || "ACTIVE").trim().toUpperCase();
    if (!["ACTIVE", "INACTIVE"].includes(cleanStatus)) {
      const error = new Error("Trạng thái (status) chỉ chấp nhận ACTIVE hoặc INACTIVE");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const parsedOrder = parseInt(stopOrder) || 1;

    return {
      route_id: parsedRouteId,
      stop_name: stopName.trim(),
      address: address.trim(),
      type: cleanType,
      stop_order: parsedOrder,
      status: cleanStatus,
    };
  }

  validateUpdate(data, existing) {
    let routeId = existing.route_id;
    if (data.routeId !== undefined) {
      routeId = parseInt(data.routeId);
      if (isNaN(routeId) || routeId <= 0) {
        const error = new Error("Mã tuyến đường không hợp lệ");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    const stopName = data.stopName !== undefined ? data.stopName.trim() : existing.stop_name;
    const address = data.address !== undefined ? data.address.trim() : existing.address;

    if (!stopName || !address) {
      const error = new Error("Tên điểm dừng và địa chỉ không được để trống");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    let type = existing.type;
    if (data.type !== undefined) {
      type = data.type.trim().toUpperCase();
      if (!["PICKUP", "DROPOFF", "BOTH"].includes(type)) {
        const error = new Error("Loại điểm dừng chỉ nhận PICKUP, DROPOFF hoặc BOTH");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    let stopOrder = existing.stop_order;
    if (data.stopOrder !== undefined) {
      stopOrder = parseInt(data.stopOrder) || 1;
    }

    let status = existing.status;
    if (data.status !== undefined) {
      status = data.status.trim().toUpperCase();
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        const error = new Error("Trạng thái chỉ nhận ACTIVE hoặc INACTIVE");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    return {
      route_id: routeId,
      stop_name: stopName,
      address,
      type,
      stop_order: stopOrder,
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

module.exports = new StopValidator();
