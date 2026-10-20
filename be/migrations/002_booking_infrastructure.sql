-- Mirrors the table names observed in Aiven. This baseline is for an empty
-- development database. Existing shared databases need an explicit reviewed
-- compatibility migration; CREATE IF NOT EXISTS does not reconcile schemas.
CREATE TABLE IF NOT EXISTS routes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  distance DECIMAL(8,2) NOT NULL,
  estimated_duration INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_routes_endpoints (origin, destination)
);

CREATE TABLE IF NOT EXISTS stops (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  route_id BIGINT UNSIGNED NOT NULL,
  stop_name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'BOTH',
  stop_order INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_stop_name (route_id, stop_name),
  FOREIGN KEY (route_id) REFERENCES routes(id)
);

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  seat_count INT NOT NULL,
  vehicle_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  CHECK (seat_count IN (5, 7))
);

CREATE TABLE IF NOT EXISTS commission_policies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  base_driver_rate DECIMAL(5,4) NOT NULL,
  increase_per_completed_trip DECIMAL(5,4) NOT NULL,
  maximum_driver_rate DECIMAL(5,4) NOT NULL,
  effective_from DATETIME(3) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (base_driver_rate > 0 AND maximum_driver_rate <= 1 AND base_driver_rate <= maximum_driver_rate),
  CHECK (increase_per_completed_trip >= 0 AND increase_per_completed_trip <= 1)
);

CREATE TABLE IF NOT EXISTS driver_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  assigned_vehicle_id BIGINT UNSIGNED NULL UNIQUE,
  approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  current_driver_rate DECIMAL(5,4) NOT NULL DEFAULT 0.70,
  points_balance BIGINT NOT NULL DEFAULT 0,
  approved_at DATETIME(3) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id),
  CHECK (current_driver_rate BETWEEN 0 AND 1),
  CHECK (points_balance >= 0)
);

CREATE TABLE IF NOT EXISTS driver_current_locations (
  driver_id BIGINT UNSIGNED PRIMARY KEY,
  current_position POINT NOT NULL SRID 4326,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (driver_id) REFERENCES driver_profiles(id),
  SPATIAL INDEX idx_driver_position (current_position)
);

CREATE TABLE IF NOT EXISTS driver_wallets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  driver_id BIGINT UNSIGNED NOT NULL UNIQUE,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (driver_id) REFERENCES driver_profiles(id),
  CHECK (balance >= 0)
);

CREATE TABLE IF NOT EXISTS booking_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_user_id CHAR(36) NOT NULL,
  accepted_driver_id BIGINT UNSIGNED NULL,
  pickup_position POINT NOT NULL SRID 4326,
  pickup_address VARCHAR(255) NOT NULL,
  destination_position POINT NOT NULL SRID 4326,
  destination_address VARCHAR(255) NOT NULL,
  requested_departure_at DATETIME(3) NOT NULL,
  seat_count INT NOT NULL,
  fare_per_seat DECIMAL(15,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  commission_policy_id BIGINT UNSIGNED NULL,
  driver_rate_at_accept DECIMAL(5,4) NULL,
  accepted_at DATETIME(3) NULL,
  customer_confirmed_at DATETIME(3) NULL,
  driver_departed_at DATETIME(3) NULL,
  completed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (customer_user_id) REFERENCES users(id),
  FOREIGN KEY (accepted_driver_id) REFERENCES driver_profiles(id),
  FOREIGN KEY (commission_policy_id) REFERENCES commission_policies(id),
  KEY idx_customer_bookings (customer_user_id, created_at, id),
  KEY idx_driver_bookings (accepted_driver_id, status, requested_departure_at),
  KEY idx_open_departure (status, requested_departure_at),
  SPATIAL INDEX idx_booking_pickup (pickup_position),
  CHECK (seat_count BETWEEN 1 AND 6),
  CHECK (fare_per_seat > 0)
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  wallet_id BIGINT UNSIGNED NOT NULL,
  booking_request_id BIGINT UNSIGNED NULL UNIQUE,
  transaction_type VARCHAR(30) NOT NULL,
  amount_delta DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (wallet_id) REFERENCES driver_wallets(id),
  FOREIGN KEY (booking_request_id) REFERENCES booking_requests(id),
  KEY idx_wallet_history (wallet_id, created_at, id),
  CHECK (balance_after >= 0)
);

CREATE TABLE IF NOT EXISTS api_operations (
  user_id CHAR(36) NOT NULL,
  scope VARCHAR(100) NOT NULL,
  operation_key VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  request_hash CHAR(64) NOT NULL,
  response_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, scope, operation_key),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
