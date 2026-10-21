const bcrypt = require("bcryptjs");
const db = require("../src/database");

const DEFAULT_ADMIN = {
  id: "admin",
  email: "admin@gmail.com",
  phone: "0900000003",
  fullName: "Admin Test",
  password: "admin123",
  role: "ADMIN",
  status: "ACTIVE",
};

async function seedAdmin() {
  try {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

    const [existing] = await db.query(
      "SELECT id, email, phone, role FROM users WHERE email = ? OR id = ? LIMIT 1",
      [DEFAULT_ADMIN.email, DEFAULT_ADMIN.id],
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE users
            SET password_hash = ?,
                role = 'ADMIN',
                status = 'ACTIVE',
                full_name = COALESCE(full_name, ?),
                phone = COALESCE(phone, ?)
          WHERE id = ? OR email = ?`,
        [
          passwordHash,
          DEFAULT_ADMIN.fullName,
          DEFAULT_ADMIN.phone,
          existing[0].id,
          DEFAULT_ADMIN.email,
        ],
      );
      console.log(`✅ Đã cập nhật tài khoản Admin:
  Email:    ${DEFAULT_ADMIN.email}
  Phone:    ${DEFAULT_ADMIN.phone}
  Password: ${DEFAULT_ADMIN.password}
  Role:     ADMIN
  Status:   ACTIVE`);
    } else {
      await db.query(
        `INSERT INTO users (id, email, phone, password_hash, full_name, role, status)
         VALUES (?, ?, ?, ?, ?, 'ADMIN', 'ACTIVE')`,
        [
          DEFAULT_ADMIN.id,
          DEFAULT_ADMIN.email,
          DEFAULT_ADMIN.phone,
          passwordHash,
          DEFAULT_ADMIN.fullName,
        ],
      );
      console.log(`✅ Đã tạo mới tài khoản Admin:
  Email:    ${DEFAULT_ADMIN.email}
  Phone:    ${DEFAULT_ADMIN.phone}
  Password: ${DEFAULT_ADMIN.password}
  Role:     ADMIN
  Status:   ACTIVE`);
    }
  } catch (error) {
    console.error("❌ Lỗi khi thiết lập tài khoản admin:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

seedAdmin();
