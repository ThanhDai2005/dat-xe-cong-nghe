import test from "node:test";
import assert from "node:assert/strict";
import { cents, money, intermediaryFee, validateDeparture, quoteSchema } from "../../src/booking/domain";
import { googleDistance } from "../../src/booking/maps";

test("TASK-80: fee uses booked seats and exact decimal arithmetic", () => {
  assert.equal(intermediaryFee("50000.00", 2, "0.7000"), 3000000n);
  assert.equal(intermediaryFee("50005.00", 3, "0.7100"), 4350435n);
  assert.equal(money(cents("9999999999999.99")), "9999999999999.99");
  assert.equal(money(-100n), "-1.00");
});
test("TASK-80: five hour boundary and untrusted fare rejection", () => {
  const now = Date.parse("2026-10-20T00:00:00Z");
  assert.doesNotThrow(() => validateDeparture("2026-10-20T05:00:00Z", now));
  assert.throws(() => validateDeparture("2026-10-20T04:59:59Z", now));
  const input = { pickup: { lat: 21, lng: 105, address: "Điểm đón" },
    destination: { lat: 22, lng: 106, address: "Điểm trả" }, departureAt: "2026-10-20T05:00:00+07:00", seatCount: 2 };
  assert.equal(quoteSchema.safeParse(input).success, true);
  assert.equal(quoteSchema.safeParse({ ...input, farePerSeat: 1 }).success, false);
  assert.equal(quoteSchema.safeParse({ ...input, seatCount: 7 }).success, false);
  assert.equal(quoteSchema.safeParse({ ...input, departureAt: "2026-10-20T05:00:00" }).success, false);
});
test("TASK-80: Google adapter requests driving distance and handles missing/failing routes", async () => {
  let request: RequestInit | undefined;
  const origin = { lat: 21, lng: 105 }, destination = { lat: 22, lng: 106 };
  const fetcher = (async (_url, options) => {
    request = options;
    return Response.json({ routes: [{ distanceMeters: 12345 }] });
  }) as typeof fetch;
  assert.equal(await googleDistance(origin, destination, "test-key", fetcher), 12345);
  assert.equal(JSON.parse(String(request?.body)).travelMode, "DRIVE");
  await assert.rejects(googleDistance(origin, destination, "key", (async () => Response.json({ routes: [] })) as typeof fetch), /hành trình/);
  await assert.rejects(googleDistance(origin, destination, "key", (async () => new Response("", { status: 503 })) as typeof fetch), /sẵn sàng/);
});
