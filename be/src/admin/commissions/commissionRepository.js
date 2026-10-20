const { db } = require("../../database");

class CommissionRepository {
  async findAll({ page = 1, limit = 10, isActive }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (isActive !== undefined && isActive !== null && isActive !== "") {
      const boolVal = isActive === "true" || isActive === true || isActive === 1 || isActive === "1";
      conditions.push("is_active = ?");
      params.push(boolVal ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) AS total FROM commission_policies ${whereClause}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0].total;

    const selectSql = `
      SELECT
        id,
        base_driver_rate,
        increase_per_completed_trip,
        maximum_driver_rate,
        effective_from,
        is_active
      FROM commission_policies
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
      `SELECT
        id,
        base_driver_rate,
        increase_per_completed_trip,
        maximum_driver_rate,
        effective_from,
        is_active
      FROM commission_policies
      WHERE id = ?
      LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async findActivePolicy() {
    const [rows] = await db.query(
      `SELECT
        id,
        base_driver_rate,
        increase_per_completed_trip,
        maximum_driver_rate,
        effective_from,
        is_active
      FROM commission_policies
      WHERE is_active = 1
      ORDER BY effective_from DESC, id DESC
      LIMIT 1`
    );
    return rows[0] || null;
  }

  async deactivateAll() {
    await db.query("UPDATE commission_policies SET is_active = 0 WHERE is_active = 1");
  }

  async create({ base_driver_rate, increase_per_completed_trip, maximum_driver_rate, effective_from, is_active = 1 }) {
    const [result] = await db.query(
      `INSERT INTO commission_policies (base_driver_rate, increase_per_completed_trip, maximum_driver_rate, effective_from, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        base_driver_rate,
        increase_per_completed_trip,
        maximum_driver_rate,
        effective_from || new Date(),
        is_active ? 1 : 0,
      ]
    );
    return result.insertId;
  }

  async update(id, { base_driver_rate, increase_per_completed_trip, maximum_driver_rate, effective_from, is_active }) {
    const fields = [];
    const params = [];

    if (base_driver_rate !== undefined) {
      fields.push("base_driver_rate = ?");
      params.push(base_driver_rate);
    }
    if (increase_per_completed_trip !== undefined) {
      fields.push("increase_per_completed_trip = ?");
      params.push(increase_per_completed_trip);
    }
    if (maximum_driver_rate !== undefined) {
      fields.push("maximum_driver_rate = ?");
      params.push(maximum_driver_rate);
    }
    if (effective_from !== undefined) {
      fields.push("effective_from = ?");
      params.push(effective_from);
    }
    if (is_active !== undefined) {
      fields.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }

    if (fields.length === 0) return false;

    params.push(id);
    const [result] = await db.query(
      `UPDATE commission_policies SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  async updateStatus(id, isActive) {
    const [result] = await db.query(
      "UPDATE commission_policies SET is_active = ? WHERE id = ?",
      [isActive ? 1 : 0, id]
    );
    return result.affectedRows > 0;
  }

  async countBookingsByPolicyId(policyId) {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS total FROM booking_requests WHERE commission_policy_id = ?",
      [policyId]
    );
    return rows[0]?.total || 0;
  }

  async deleteById(id) {
    const [result] = await db.query("DELETE FROM commission_policies WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new CommissionRepository();
