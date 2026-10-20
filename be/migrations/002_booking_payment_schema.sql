-- Data model required by POST /api/customer/v1/bookings and
-- POST /api/customer/v1/payments/process.
-- Existing tables used by the API: users, routes, stops, vehicles.

CREATE TABLE IF NOT EXISTS booking_types (
  id BIGINT NOT NULL AUTO_INCREMENT,
  type_name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_booking_types_name (type_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trips (
  id BIGINT NOT NULL AUTO_INCREMENT,
  route_id BIGINT NOT NULL,
  vehicle_id BIGINT NOT NULL,
  departure_time DATETIME(3) NOT NULL,
  price DECIMAL(12,2) NULL,
  status ENUM('OPEN', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_trips_route_departure (route_id, departure_time),
  KEY idx_trips_vehicle_departure (vehicle_id, departure_time)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fares (
  id BIGINT NOT NULL AUTO_INCREMENT,
  route_id BIGINT NOT NULL,
  booking_type_id BIGINT NOT NULL,
  base_price DECIMAL(12,2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_fares_lookup (route_id, booking_type_id, is_active),
  CONSTRAINT fk_fares_booking_type
    FOREIGN KEY (booking_type_id) REFERENCES booking_types(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  id CHAR(36) NOT NULL,
  customer_id CHAR(36) NOT NULL,
  trip_id BIGINT NOT NULL,
  pickup_point_id BIGINT NOT NULL,
  dropoff_point_id BIGINT NOT NULL,
  booking_type_id BIGINT NOT NULL,
  seat_count INT NOT NULL,
  fare_per_seat DECIMAL(12,2) NOT NULL,
  total_fare DECIMAL(12,2) NOT NULL,
  booking_status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED')
    NOT NULL DEFAULT 'PENDING',
  payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED')
    NOT NULL DEFAULT 'PENDING',
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_bookings_customer_created (customer_id, created_at),
  KEY idx_bookings_trip_status (trip_id, booking_status),
  CONSTRAINT fk_bookings_booking_type
    FOREIGN KEY (booking_type_id) REFERENCES booking_types(id),
  CONSTRAINT fk_bookings_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS booking_seats (
  booking_id CHAR(36) NOT NULL,
  trip_id BIGINT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (booking_id, seat_number),
  UNIQUE KEY uq_booking_seats_trip_seat (trip_id, seat_number),
  CONSTRAINT fk_booking_seats_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_seats_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) NOT NULL,
  booking_id CHAR(36) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'MOMO', 'VNPAY', 'BANK_TRANSFER') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
  paid_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_booking (booking_id),
  CONSTRAINT fk_payments_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
) ENGINE=InnoDB;

INSERT INTO booking_types (id, type_name, description, is_active)
VALUES (1, 'STANDARD', 'Đặt ghế tiêu chuẩn', 1)
ON DUPLICATE KEY UPDATE type_name = type_name;
