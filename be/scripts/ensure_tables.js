const db = require("../src/database");

async function run() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS booking_quotes (
      id CHAR(36) PRIMARY KEY,
      customer_user_id CHAR(36) NOT NULL,
      payload JSON NOT NULL,
      distance_meters INT NOT NULL,
      fare_per_seat DECIMAL(15,2) NOT NULL,
      provider VARCHAR(20) NOT NULL,
      expires_at DATETIME(3) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      FOREIGN KEY (customer_user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS booking_details (
      booking_id BIGINT UNSIGNED PRIMARY KEY,
      quote_id CHAR(36) NOT NULL UNIQUE,
      contact_name VARCHAR(150) NOT NULL,
      contact_phone VARCHAR(20) NOT NULL,
      note VARCHAR(500) NOT NULL DEFAULT '',
      distance_meters INT NOT NULL,
      vehicle_id BIGINT UNSIGNED NULL,
      base_rate_at_accept DECIMAL(5,4) NULL,
      increase_at_accept DECIMAL(5,4) NULL,
      max_rate_at_accept DECIMAL(5,4) NULL,
      closed_at DATETIME(3) NULL,
      closed_reason VARCHAR(500) NULL,
      FOREIGN KEY (booking_id) REFERENCES booking_requests(id),
      FOREIGN KEY (quote_id) REFERENCES booking_quotes(id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    )`,
    `CREATE TABLE IF NOT EXISTS booking_events (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      booking_id BIGINT UNSIGNED NOT NULL,
      actor_user_id CHAR(36) NULL,
      from_status VARCHAR(30) NULL,
      to_status VARCHAR(30) NOT NULL,
      reason VARCHAR(500) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      FOREIGN KEY (booking_id) REFERENCES booking_requests(id),
      FOREIGN KEY (actor_user_id) REFERENCES users(id),
      KEY idx_booking_events (booking_id, id)
    )`,
    `CREATE TABLE IF NOT EXISTS wallet_transaction_details (
      transaction_id BIGINT UNSIGNED PRIMARY KEY,
      performed_by CHAR(36) NOT NULL,
      external_reference VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NULL UNIQUE,
      reason VARCHAR(500) NOT NULL,
      related_booking_id BIGINT UNSIGNED NULL,
      FOREIGN KEY (transaction_id) REFERENCES wallet_transactions(id),
      FOREIGN KEY (performed_by) REFERENCES users(id),
      FOREIGN KEY (related_booking_id) REFERENCES booking_requests(id)
    )`,
    `CREATE TABLE IF NOT EXISTS fee_refunds (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      original_transaction_id BIGINT UNSIGNED NOT NULL UNIQUE,
      refund_transaction_id BIGINT UNSIGNED NOT NULL UNIQUE,
      booking_id BIGINT UNSIGNED NOT NULL UNIQUE,
      performed_by CHAR(36) NOT NULL,
      reason VARCHAR(500) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      FOREIGN KEY (original_transaction_id) REFERENCES wallet_transactions(id),
      FOREIGN KEY (refund_transaction_id) REFERENCES wallet_transactions(id),
      FOREIGN KEY (booking_id) REFERENCES booking_requests(id),
      FOREIGN KEY (performed_by) REFERENCES users(id)
    )`
  ];

  for (const sql of statements) {
    try {
      await db.query(sql);
    } catch (e) {
      console.log("Notice: " + e.message);
    }
  }

  console.log("All tables ready!");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
