-- Optional vehicle-type dimension for admin fare configuration.
-- Existing fares and vehicles remain valid with NULL (all vehicle types).
CREATE TABLE IF NOT EXISTS vehicle_types (
  id BIGINT NOT NULL AUTO_INCREMENT,
  type_name VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicle_types_name (type_name)
) ENGINE=InnoDB;

ALTER TABLE vehicles ADD COLUMN vehicle_type_id BIGINT NULL;
ALTER TABLE fares ADD COLUMN vehicle_type_id BIGINT NULL;

CREATE INDEX idx_fares_admin_lookup
  ON fares (route_id, booking_type_id, vehicle_type_id, is_active);
