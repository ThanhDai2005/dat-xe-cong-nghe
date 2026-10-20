const fs = require("fs");
const path = require("path");
const database = require("../src/database");

const migrations = [
  "002_booking_payment_schema.sql",
  "003_booking_customer_details.sql",
  "004_admin_fares_vehicle_types.sql",
];

const main = async () => {
  try {
    for (const filename of migrations) {
      const migrationPath = path.join(__dirname, "../migrations", filename);
      const statements = fs.readFileSync(migrationPath, "utf8")
        .replace(/^--.*$/gm, "")
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);
      let applied = 0;
      for (const statement of statements) {
        const alter = statement.match(/^ALTER TABLE (\w+) ADD COLUMN ([a-z_]+)/i);
        const column = alter?.[2];
        if (column) {
          const [existing] = await database.query(
            `SELECT 1 FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                AND COLUMN_NAME = ? LIMIT 1`,
            [alter[1], column],
          );
          if (existing.length) continue;
        }
        const index = statement.match(/^CREATE INDEX (\w+) ON (\w+)/i);
        if (index) {
          const [existing] = await database.query(
            `SELECT 1 FROM information_schema.STATISTICS
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                AND INDEX_NAME = ? LIMIT 1`,
            [index[2], index[1]],
          );
          if (existing.length) continue;
        }
        await database.query(statement);
        applied += 1;
      }
      console.log(`${filename}: đã chạy ${applied} câu lệnh cần thiết`);
    }
  } finally {
    await database.end();
  }
};

main().catch((error) => {
  console.error("Áp dụng schema đặt vé thất bại:", error.message);
  process.exitCode = 1;
});
