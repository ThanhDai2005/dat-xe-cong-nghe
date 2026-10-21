const db = require("../../database");

class RouteRepository {
  async findAll({ page = 1, limit = 10, search, status }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      conditions.push("(origin LIKE ? OR destination LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (status && status.trim()) {
      conditions.push("status = ?");
      params.push(status.trim().toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Đếm tổng số bản ghi
    const countSql = `SELECT COUNT(*) AS total FROM routes ${whereClause}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0].total;

    // Lấy danh sách phân trang
    const selectSql = `
      SELECT id, origin, destination, distance, estimated_duration, status, created_at, updated_at
      FROM routes
      ${whereClause}
      ORDER BY id DESC
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
      `SELECT id, origin, destination, distance, estimated_duration, status, created_at, updated_at
       FROM routes
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByOriginAndDestination(origin, destination, excludeId = null) {
    let sql = `
      SELECT id, origin, destination, distance, estimated_duration, status
      FROM routes
      WHERE LOWER(TRIM(origin)) = LOWER(TRIM(?))
        AND LOWER(TRIM(destination)) = LOWER(TRIM(?))
    `;
    const params = [origin, destination];

    if (excludeId) {
      sql += " AND id != ?";
      params.push(excludeId);
    }

    sql += " LIMIT 1";
    const [rows] = await db.query(sql, params);
    return rows[0] || null;
  }

  async create({ origin, destination, distance, estimated_duration, status = "ACTIVE" }) {
    const [result] = await db.query(
      `INSERT INTO routes (origin, destination, distance, estimated_duration, status)
       VALUES (?, ?, ?, ?, ?)`,
      [origin.trim(), destination.trim(), distance, estimated_duration, status]
    );
    return result.insertId;
  }

  async update(id, { origin, destination, distance, estimated_duration, status }) {
    const fields = [];
    const params = [];

    if (origin !== undefined) {
      fields.push("origin = ?");
      params.push(origin.trim());
    }
    if (destination !== undefined) {
      fields.push("destination = ?");
      params.push(destination.trim());
    }
    if (distance !== undefined) {
      fields.push("distance = ?");
      params.push(distance);
    }
    if (estimated_duration !== undefined) {
      fields.push("estimated_duration = ?");
      params.push(estimated_duration);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      params.push(status.trim().toUpperCase());
    }

    if (fields.length === 0) return false;

    params.push(id);
    const [result] = await db.query(
      `UPDATE routes SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  async updateStatus(id, status) {
    const [result] = await db.query(
      "UPDATE routes SET status = ? WHERE id = ?",
      [status.trim().toUpperCase(), id]
    );
    return result.affectedRows > 0;
  }

  async countStopsByRouteId(routeId) {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS count FROM stops WHERE route_id = ?",
      [routeId]
    );
    return rows[0]?.count || 0;
  }

  async deleteById(id) {
    const [result] = await db.query("DELETE FROM routes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new RouteRepository();
