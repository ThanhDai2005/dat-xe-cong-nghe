
export type RouteOption = {
  id: string;
  name: string;
  pricePerSeat: number;
  points: number;
  note?: string;
};

export type Trip = {
  id: string;
  routeId: string;
  departureAt: string;
  availableSeats: number;
  vehicle: string;
  pricePerSeat: number;
  points: number;
};

export const ROUTES: RouteOption[] = [
  {
    id: "hp-bn-bg",
    name: "Hải Phòng ↔ Bắc Ninh / Bắc Giang",
    pricePerSeat: 450000,
    points: 0.5,
    note: "Có thể phát sinh phí cao tốc hoặc phụ phí theo điểm đón.",
  },
  {
    id: "hp-hd-bn-hd",
    name: "Hải Phòng ↔ Hải Dương / Bắc Ninh ↔ Hải Dương",
    pricePerSeat: 250000,
    points: 0.25,
  },
  {
    id: "hp-hn",
    name: "Hải Phòng ↔ Hà Nội",
    pricePerSeat: 400000,
    points: 0.5,
    note: "Có thể phát sinh phí cao tốc. Xe 7 chỗ có thể phụ thu.",
  },
  {
    id: "hn-hl",
    name: "Hà Nội ↔ Hạ Long",
    pricePerSeat: 450000,
    points: 0.5,
    note: "Giá cuối cùng phụ thuộc loại xe và chính sách tuyến.",
  },
  {
    id: "hl-bn-bg",
    name: "Hạ Long ↔ Bắc Ninh / Bắc Giang",
    pricePerSeat: 450000,
    points: 0.5,
  },
  {
    id: "hp-tn",
    name: "Hải Phòng ↔ Thái Nguyên",
    pricePerSeat: 600000,
    points: 0.5,
  },
  {
    id: "hp-hl",
    name: "Hải Phòng ↔ Hạ Long",
    pricePerSeat: 250000,
    points: 0.5,
  },
  {
    id: "hp-cp",
    name: "Hải Phòng ↔ Cẩm Phả",
    pricePerSeat: 300000,
    points: 0.5,
  },
];

const DEMO_DEPARTURE_HOURS = [6, 8, 10, 13, 15, 17, 19];

/**
 * Lịch chuyến giả lập để kiểm tra giao diện.
 * Thay hàm này bằng API lịch xe thực tế khi tích hợp backend.
 */
export function createDemoTrips(route: RouteOption): Trip[] {
  const now = new Date();
  const trips: Trip[] = [];

  for (let day = 0; day < 7; day++) {
    for (let index = 0; index < DEMO_DEPARTURE_HOURS.length; index++) {
      const departure = new Date(now);

      departure.setDate(now.getDate() + day);
      departure.setHours(DEMO_DEPARTURE_HOURS[index], 0, 0, 0);

      if (departure <= now) continue;

      trips.push({
        id: `${route.id}-${departure.getTime()}`,
        routeId: route.id,
        departureAt: departure.toISOString(),
        // Số ghế mẫu, không phải số ghế thực tế.
        availableSeats: 1 + ((day + index) % 4),
        vehicle: "Xe ghép",
        pricePerSeat: route.pricePerSeat,
        points: route.points,
      });
    }
  }

  return trips.sort(
    (a, b) =>
      new Date(a.departureAt).getTime() -
      new Date(b.departureAt).getTime(),
  );
}

export function formatMoney(value: number): string {
  return `${value.toLocaleString("vi-VN")} đ`;
}

export function formatDateTime(
  value: string,
  en = false,
): string {
  return new Intl.DateTimeFormat(en ? "en-GB" : "vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
