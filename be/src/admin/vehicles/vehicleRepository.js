const { db } = require("../../database");

class VehicleRepository {
  async findAll({ page = 1, limit = 10, search, status, seatCount }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      conditions.push("v.license_plate LIKE ?");
      params.push(`%${search.trim()}%`);
    }

    if (status && status.trim()) {
      conditions.push("v.vehicle_status = ?");
      params.push(status.trim().toUpperCase());
    }

    if (seatCount) {
      conditions.push("v.seat_count = ?");
      params.push(parseInt(seatCount));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) AS total FROM vehicles v ${whereClause}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0].total;

    const selectSql = `
      SELECT 
        v.id, 
        v.license_plate, 
        v.seat_count, 
        v.vehicle_status,
        dp.id AS assigned_driver_id,
        u.full_name AS assigned_driver_name,
        u.phone AS assigned_driver_phone
      FROM vehicles v
      LEFT JOIN driver_profiles dp ON v.id = dp.assigned_vehicle_id
      LEFT JOIN users u ON dp.user_id = u.id
      ${whereClause}
      ORDER BY v.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(selectSql, [...params, limit, offset]);

    return {
      items: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        v.id, 
        v.license_plate, 
        v.seat_count, 
        v.vehicle_status,
        dp.id AS assigned_driver_id,
        u.full_name AS assigned_driver_name,
        u.phone AS assigned_driver_phone
      FROM vehicles v
      LEFT JOIN driver_profiles dp ON v.id = dp.assigned_vehicle_id
      LEFT JOIN users u ON dp.user_id = u.id
      WHERE v.id = ?
      LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByLicensePlate(licensePlate, excludeId = null) {
    let sql = "SELECT id, license_plate FROM vehicles WHERE LOWER(TRIM(license_plate)) = LOWER(TRIM(?))";
    const params = [licensePlate];

    if (excludeId) {
      sql += " AND id != ?";
      params.push(excludeId);
    }

    sql += " LIMIT 1";
    const [rows] = await db.query(sql, params);
    return rows[0] || null;
  }

  async checkDriverAssignment(vehicleId) {
    const [rows] = await db.query(
      `SELECT dp.id, dp.user_id, u.full_name, u.phone, dp.approval_status
       FROM driver_profiles dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.assigned_vehicle_id = ?
       LIMIT 1`,
      [vehicleId]
    );
    return rows[0] || null;
  }

  async create({ license_plate, seat_count, vehicle_status = "ACTIVE" }) {
    const [result] = await db.query(
      `INSERT INTO vehicles (license_plate, seat_count, vehicle_status)
       VALUES (?, ?, ?)`,
      [license_plate.trim().toUpperCase(), seat_count, vehicle_status]
    );
    return result.insertId;
  }

  async update(id, { license_plate, seat_count, vehicle_status }) {
    const fields = [];
    const params = [];

    if (license_plate !== undefined) {
      fields.push("license_plate = ?");
      params.push(license_plate.trim().toUpperCase());
    }
    if (seat_count !== undefined) {
      fields.push("seat_count = ?");
      params.push(seat_count);
    }
    if (vehicle_status !== undefined) {
      fields.push("vehicle_status = ?");
      params.push(vehicle_status.trim().toUpperCase());
    }

    if (fields.length === 0) return false;

    params.push(id);
    const [result] = await db.query(
      `UPDATE vehicles SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  async updateStatus(id, status) {
    const [result] = await db.query(
      "UPDATE vehicles SET vehicle_status = ? WHERE id = ?",
      [status.trim().toUpperCase(), id]
    );
    return result.affectedRows > 0;
  }

  async deleteById(id) {
    const [result] = await db.query("DELETE FROM vehicles WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new VehicleRepository();
