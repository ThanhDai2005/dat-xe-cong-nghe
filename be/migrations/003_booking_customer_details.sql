-- Optional customer-facing fields retained from the booking form.
ALTER TABLE bookings ADD COLUMN customer_name VARCHAR(100) NULL;
ALTER TABLE bookings ADD COLUMN contact_phone VARCHAR(32) NULL;
ALTER TABLE bookings ADD COLUMN driver_note TEXT NULL;
ALTER TABLE bookings ADD COLUMN pickup_address VARCHAR(255) NULL;
ALTER TABLE bookings ADD COLUMN dropoff_address VARCHAR(255) NULL;
