CREATE TABLE IF NOT EXISTS fee_refunds (
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
);
