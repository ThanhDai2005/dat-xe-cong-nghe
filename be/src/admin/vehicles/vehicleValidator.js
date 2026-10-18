class VehicleValidator {
  validateCreate(data) {
    const rawPlate = data.licensePlate || data.license_plate;
    const rawSeats = data.seatCount || data.seat_count || data.totalSeats;
    const rawStatus = data.status || data.vehicleStatus || data.vehicle_status || "ACTIVE";

    if (!rawPlate || typeof rawPlate !== "string" || !rawPlate.trim()) {
      const error = new Error("Biển số xe (licensePlate) không được để trống");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const cleanPlate = rawPlate.trim().toUpperCase();

    const seatCount = parseInt(rawSeats);
    if (![5, 7].includes(seatCount)) {
      const error = new Error("Số chỗ ngồi (seatCount / totalSeats) chỉ chấp nhận 5 hoặc 7 chỗ theo quy định");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const cleanStatus = rawStatus.trim().toUpperCase();
    if (!["ACTIVE", "MAINTENANCE", "INACTIVE"].includes(cleanStatus)) {
      const error = new Error("Trạng thái xe chỉ nhận: ACTIVE, MAINTENANCE hoặc INACTIVE");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    return {
      license_plate: cleanPlate,
      seat_count: seatCount,
      vehicle_status: cleanStatus,
    };
  }

  validateUpdate(data, existing) {
    const rawPlate = data.licensePlate || data.license_plate;
    let licensePlate = existing.license_plate;
    if (rawPlate !== undefined) {
      if (typeof rawPlate !== "string" || !rawPlate.trim()) {
        const error = new Error("Biển số xe không được để trống");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
      licensePlate = rawPlate.trim().toUpperCase();
    }

    const rawSeats = data.seatCount || data.seat_count || data.totalSeats;
    let seatCount = existing.seat_count;
    if (rawSeats !== undefined) {
      seatCount = parseInt(rawSeats);
      if (![5, 7].includes(seatCount)) {
        const error = new Error("Số chỗ ngồi chỉ nhận 5 hoặc 7 chỗ");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    const rawStatus = data.status || data.vehicleStatus || data.vehicle_status;
    let vehicleStatus = existing.vehicle_status;
    if (rawStatus !== undefined) {
      vehicleStatus = rawStatus.trim().toUpperCase();
      if (!["ACTIVE", "MAINTENANCE", "INACTIVE"].includes(vehicleStatus)) {
        const error = new Error("Trạng thái xe chỉ nhận ACTIVE, MAINTENANCE hoặc INACTIVE");
        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }
    }

    return {
      license_plate: licensePlate,
      seat_count: seatCount,
      vehicle_status: vehicleStatus,
    };
  }

  validateStatus(status) {
    const cleanStatus = (status || "").trim().toUpperCase();
    if (!["ACTIVE", "MAINTENANCE", "INACTIVE"].includes(cleanStatus)) {
      const error = new Error("Trạng thái xe chỉ nhận: ACTIVE, MAINTENANCE hoặc INACTIVE");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }
    return cleanStatus;
  }
}

module.exports = new VehicleValidator();
