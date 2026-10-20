const { db } = require("../../database");

class StopRepository {
  async findAll({ page = 1, limit = 10, search, routeId, type, status }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      conditions.push("(s.stop_name LIKE ? OR s.address LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (routeId) {
      conditions.push("s.route_id = ?");
      params.push(routeId);
    }

    if (type && type.trim()) {
      conditions.push("s.type = ?");
      params.push(type.trim().toUpperCase());
    }

    if (status && status.trim()) {
      conditions.push("s.status = ?");
      params.push(status.trim().toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) AS total FROM stops s ${whereClause}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0].total;

    const selectSql = `
      SELECT 
        s.id, 
        s.route_id, 
        s.stop_name, 
        s.address, 
        s.type, 
        s.stop_order, 
        s.status, 
        s.created_at, 
        s.updated_at,
        r.origin AS route_origin,
        r.destination AS route_destination
      FROM stops s
      LEFT JOIN routes r ON s.route_id = r.id
      ${whereClause}
      ORDER BY s.route_id ASC, s.stop_order ASC, s.id ASC
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
        s.id, 
        s.route_id, 
        s.stop_name, 
        s.address, 
        s.type, 
        s.stop_order, 
        s.status, 
        s.created_at, 
        s.updated_at,
        r.origin AS route_origin,
        r.destination AS route_destination
      FROM stops s
      LEFT JOIN routes r ON s.route_id = r.id
      WHERE s.id = ?
      LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByRouteAndName(routeId, stopName, excludeId = null) {
    let sql = `
      SELECT id, route_id, stop_name 
      FROM stops 
      WHERE route_id = ? AND LOWER(TRIM(stop_name)) = LOWER(TRIM(?))
    `;
    const params = [routeId, stopName];

    if (excludeId) {
      sql += " AND id != ?";
      params.push(excludeId);
    }

    sql += " LIMIT 1";
    const [rows] = await db.query(sql, params);
    return rows[0] || null;
  }

  async create({ route_id, stop_name, address, type = "BOTH", stop_order = 1, status = "ACTIVE" }) {
    const [result] = await db.query(
      `INSERT INTO stops (route_id, stop_name, address, type, stop_order, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [route_id, stop_name.trim(), address.trim(), type, stop_order, status]
    );
    return result.insertId;
  }

  async update(id, { route_id, stop_name, address, type, stop_order, status }) {
    const fields = [];
    const params = [];

    if (route_id !== undefined) {
      fields.push("route_id = ?");
      params.push(route_id);
    }
    if (stop_name !== undefined) {
      fields.push("stop_name = ?");
      params.push(stop_name.trim());
    }
    if (address !== undefined) {
      fields.push("address = ?");
      params.push(address.trim());
    }
    if (type !== undefined) {
      fields.push("type = ?");
      params.push(type.trim().toUpperCase());
    }
    if (stop_order !== undefined) {
      fields.push("stop_order = ?");
      params.push(stop_order);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      params.push(status.trim().toUpperCase());
    }

    if (fields.length === 0) return false;

    params.push(id);
    const [result] = await db.query(
      `UPDATE stops SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  async updateStatus(id, status) {
    const [result] = await db.query(
      "UPDATE stops SET status = ? WHERE id = ?",
      [status.trim().toUpperCase(), id]
    );
    return result.affectedRows > 0;
  }

  async deleteById(id) {
    const [result] = await db.query("DELETE FROM stops WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new StopRepository();
