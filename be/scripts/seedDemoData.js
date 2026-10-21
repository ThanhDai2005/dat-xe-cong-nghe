/**
 * Script thiết lập dữ liệu mẫu cho hệ thống GoRide.
 * Tạo: tuyến đường, xe, loại xe, biểu cước, chuyến xe, đặt chỗ.
 *
 * Chạy: node scripts/seedDemoData.js
 */
const db = require("../src/database");
const { v4: uuidv4 } = require("uuid");

const pad = (n) => String(n).padStart(2, "0");
const toMySQL = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

async function seed() {
  console.log("🚀 Đang tạo dữ liệu mẫu cho GoRide…\n");

  /* ═══════════════════ BOOKING TYPES ═══════════════════ */
  const [existingBT] = await db.query("SELECT id FROM booking_types LIMIT 1");
  if (!existingBT.length) {
    await db.query(
      `INSERT INTO booking_types (type_name, description, is_active) VALUES
        ('STANDARD', 'Đặt vé tiêu chuẩn', 1),
        ('VIP',      'Đặt vé VIP ưu tiên', 1)`
    );
    console.log("  ✅ Đã tạo 2 booking types");
  } else {
    console.log("  ⏭️  booking_types đã có dữ liệu, bỏ qua");
  }
  const [bookingTypes] = await db.query("SELECT id, type_name FROM booking_types");

  /* ═══════════════════ VEHICLE TYPES ═══════════════════ */
  const [existingVT] = await db.query("SELECT id FROM vehicle_types LIMIT 1");
  if (!existingVT.length) {
    await db.query(
      `INSERT INTO vehicle_types (type_name, is_active) VALUES
        ('Ghế ngồi 29 chỗ', 1),
        ('Giường nằm 40 chỗ', 1),
        ('Limousine 9 chỗ VIP', 1)`
    );
    console.log("  ✅ Đã tạo 3 vehicle types");
  } else {
    console.log("  ⏭️  vehicle_types đã có dữ liệu, bỏ qua");
  }
  const [vehicleTypes] = await db.query("SELECT id, type_name FROM vehicle_types");

  /* ═══════════════════ ROUTES ═══════════════════ */
  const [existingRoutes] = await db.query("SELECT id FROM routes LIMIT 1");
  if (!existingRoutes.length) {
    await db.query(
      `INSERT INTO routes (origin, destination, distance, estimated_duration, status) VALUES
        ('TP.HCM',    'Đà Lạt',   310, 420, 'ACTIVE'),
        ('TP.HCM',    'Nha Trang', 430, 540, 'ACTIVE'),
        ('TP.HCM',    'Vũng Tàu',  125, 150, 'ACTIVE'),
        ('Hà Nội',    'Hải Phòng', 120, 150, 'ACTIVE'),
        ('Hà Nội',    'Sapa',      320, 360, 'ACTIVE'),
        ('Đà Nẵng',   'Huế',       100, 120, 'ACTIVE')`
    );
    console.log("  ✅ Đã tạo 6 tuyến đường");
  } else {
    console.log("  ⏭️  routes đã có dữ liệu, bỏ qua");
  }
  const [routes] = await db.query("SELECT id, origin, destination FROM routes");

  /* ═══════════════════ VEHICLES ═══════════════════ */
  const [existingVehicles] = await db.query("SELECT id FROM vehicles LIMIT 1");
  if (!existingVehicles.length) {
    const vtMap = {};
    for (const vt of vehicleTypes) vtMap[vt.type_name] = vt.id;
    const firstVT = vehicleTypes[0]?.id || null;
    const secondVT = vehicleTypes[1]?.id || firstVT;
    const thirdVT = vehicleTypes[2]?.id || firstVT;
    const vehicleData = [
      ["51B-123.45", 7, firstVT],
      ["51B-678.90", 7, secondVT],
      ["51B-111.22", 7, thirdVT],
      ["30A-456.78", 5, firstVT],
      ["30A-789.01", 7, secondVT],
      ["43C-234.56", 5, firstVT],
      ["43C-567.89", 7, thirdVT],
      ["51B-333.44", 7, secondVT],
    ];
    for (const [plate, seats, typeId] of vehicleData) {
      await db.query(
        "INSERT INTO vehicles (license_plate, seat_count, vehicle_type_id, vehicle_status) VALUES (?, ?, ?, 'ACTIVE')",
        [plate, seats, typeId]
      );
    }
    console.log(`  ✅ Đã tạo ${vehicleData.length} xe`);
  } else {
    console.log("  ⏭️  vehicles đã có dữ liệu, bỏ qua");
  }
  const [vehicles] = await db.query("SELECT id, license_plate, seat_count FROM vehicles");

  /* ═══════════════════ FARES ═══════════════════ */
  const [existingFares] = await db.query("SELECT id FROM fares WHERE is_active = 1 LIMIT 1");
  if (!existingFares.length) {
    const standardBT = bookingTypes.find((t) => t.type_name === "STANDARD");
    const vipBT = bookingTypes.find((t) => t.type_name === "VIP");
    const basePrices = {
      "TP.HCM-Đà Lạt": 250000,
      "TP.HCM-Nha Trang": 350000,
      "TP.HCM-Vũng Tàu": 120000,
      "Hà Nội-Hải Phòng": 100000,
      "Hà Nội-Sapa": 350000,
      "Đà Nẵng-Huế": 80000,
    };
    let fareCount = 0;
    for (const route of routes) {
      const key = `${route.origin}-${route.destination}`;
      const price = basePrices[key] || 200000;
      // STANDARD — all vehicle types
      await db.query(
        "INSERT INTO fares (route_id, booking_type_id, vehicle_type_id, base_price, is_active) VALUES (?, ?, NULL, ?, 1)",
        [route.id, standardBT.id, price]
      );
      fareCount++;
      // VIP — Limousine only
      const limo = vehicleTypes.find((vt) => vt.type_name.includes("Limousine"));
      if (vipBT && limo) {
        await db.query(
          "INSERT INTO fares (route_id, booking_type_id, vehicle_type_id, base_price, is_active) VALUES (?, ?, ?, ?, 1)",
          [route.id, vipBT.id, limo.id, Math.round(price * 1.8)]
        );
        fareCount++;
      }
    }
    console.log(`  ✅ Đã tạo ${fareCount} cấu hình giá vé`);
  } else {
    console.log("  ⏭️  fares đã có dữ liệu, bỏ qua");
  }

  /* ═══════════════════ TRIPS ═══════════════════ */
  const [existingTrips] = await db.query("SELECT id FROM trips LIMIT 1");
  if (!existingTrips.length) {
    const now = new Date();
    const tripConfigs = [];

    for (let dayOffset = -3; dayOffset <= 7; dayOffset++) {
      const day = new Date(now);
      day.setDate(day.getDate() + dayOffset);
      // 2-3 trips per day on different routes
      for (let i = 0; i < Math.min(routes.length, 3); i++) {
        const route = routes[i % routes.length];
        const vehicle = vehicles[(i + Math.abs(dayOffset)) % vehicles.length];
        const departure = new Date(day);
        departure.setHours(6 + i * 4, 0, 0, 0);
        const price = 150000 + i * 50000;
        const status = dayOffset < 0 ? "CLOSED" : "OPEN";
        tripConfigs.push([route.id, vehicle.id, toMySQL(departure), price, status]);
      }
    }
    for (const [routeId, vehicleId, depTime, price, status] of tripConfigs) {
      await db.query(
        "INSERT INTO trips (route_id, vehicle_id, departure_time, price, status) VALUES (?, ?, ?, ?, ?)",
        [routeId, vehicleId, depTime, price, status]
      );
    }
    console.log(`  ✅ Đã tạo ${tripConfigs.length} chuyến xe`);
  } else {
    console.log("  ⏭️  trips đã có dữ liệu, bỏ qua");
  }
  const [trips] = await db.query("SELECT id, vehicle_id, route_id FROM trips ORDER BY id LIMIT 20");

  /* ═══════════════════ STOPS ═══════════════════ */
  const [existingStops] = await db.query("SELECT id FROM stops LIMIT 1");
  if (!existingStops.length) {
    for (const route of routes) {
      await db.query(
        "INSERT INTO stops (route_id, stop_name, address, type, stop_order) VALUES (?, ?, ?, 'PICKUP', 1)",
        [route.id, `BX ${route.origin}`, `Bến xe ${route.origin}`]
      );
      await db.query(
        "INSERT INTO stops (route_id, stop_name, address, type, stop_order) VALUES (?, ?, ?, 'DROPOFF', 2)",
        [route.id, `BX ${route.destination}`, `Bến xe ${route.destination}`]
      );
    }
    console.log(`  ✅ Đã tạo ${routes.length * 2} điểm dừng`);
  } else {
    console.log("  ⏭️  stops đã có dữ liệu, bỏ qua");
  }
  const [stops] = await db.query("SELECT id, route_id, type FROM stops");

  /* ═══════════════════ BOOKINGS & SEATS ═══════════════════ */
  const [existingBookings] = await db.query("SELECT id FROM bookings LIMIT 1");
  if (!existingBookings.length && trips.length > 0) {
    const customers = [
      { name: "Nguyễn Văn An",    phone: "0901234567" },
      { name: "Trần Thị Bình",    phone: "0912345678" },
      { name: "Lê Hoàng Cường",   phone: "0923456789" },
      { name: "Phạm Minh Đức",    phone: "0934567890" },
      { name: "Hoàng Thị Em",     phone: "0945678901" },
      { name: "Vũ Quốc Phong",    phone: "0956789012" },
      { name: "Đặng Thùy Giang",  phone: "0967890123" },
      { name: "Bùi Thanh Hải",    phone: "0978901234" },
    ];
    let bookingCount = 0;
    const [fares] = await db.query("SELECT id, route_id, base_price FROM fares WHERE is_active = 1");
    const [bTypes] = await db.query("SELECT id FROM booking_types LIMIT 1");
    const defaultBT = bTypes[0]?.id || 1;

    for (let t = 0; t < Math.min(trips.length, 12); t++) {
      const trip = trips[t];
      // Find pickup/dropoff stops for this trip's route
      const pickup = stops.find((s) => String(s.route_id) === String(trip.route_id) && s.type === "PICKUP");
      const dropoff = stops.find((s) => String(s.route_id) === String(trip.route_id) && s.type === "DROPOFF");
      if (!pickup || !dropoff) continue;

      // 1-3 bookings per trip
      const numBookings = 1 + (t % 3);
      for (let b = 0; b < numBookings; b++) {
        const cust = customers[(t * 3 + b) % customers.length];
        const seatCount = 1 + (b % 2);
        const fare = fares.find((f) => String(f.route_id) === String(trip.route_id));
        const farePerSeat = fare ? Number(fare.base_price) : 150000;
        const totalFare = farePerSeat * seatCount;
        const bookingId = uuidv4();
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - (12 - t));
        const status = b === 0 ? "CONFIRMED" : (b === 1 ? "CONFIRMED" : "PENDING");
        const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);

        await db.query(
          `INSERT INTO bookings (id, customer_id, trip_id, pickup_point_id, dropoff_point_id, booking_type_id, seat_count, fare_per_seat, total_fare,
             booking_status, payment_status, expires_at, created_at, updated_at, customer_name, contact_phone)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bookingId,
            "customer-" + ((t * 3 + b) % 5 + 1),
            trip.id,
            pickup.id,
            dropoff.id,
            defaultBT,
            seatCount,
            farePerSeat,
            totalFare,
            status,
            status === "CONFIRMED" ? "PAID" : "PENDING",
            toMySQL(expiresAt),
            toMySQL(createdAt),
            toMySQL(createdAt),
            cust.name,
            cust.phone,
          ]
        );

        // Insert seat numbers
        for (let s = 1; s <= seatCount; s++) {
          const seatNum = b * 2 + s;
          await db.query(
            "INSERT INTO booking_seats (booking_id, trip_id, seat_number) VALUES (?, ?, ?)",
            [bookingId, trip.id, seatNum]
          );
        }
        bookingCount++;
      }
    }
    console.log(`  ✅ Đã tạo ${bookingCount} đơn đặt chỗ với ghế ngồi`);
  } else {
    console.log("  ⏭️  bookings đã có dữ liệu, bỏ qua");
  }

  console.log("\n🎉 Hoàn tất thiết lập dữ liệu mẫu!");
  await db.end();
}

seed().catch((err) => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});
