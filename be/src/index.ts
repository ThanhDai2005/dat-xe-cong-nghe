import { app } from "./app";
import { config } from "./config";
import { expireBookings } from "./booking/service";
app.listen(config.PORT, () => console.log(`GoRide API listening on ${config.PORT}`));
let expiring = false;
setInterval(async () => {
  if (expiring) return;
  expiring = true;
  try { await expireBookings(); } catch { console.error("Booking expiry failed"); }
  finally { expiring = false; }
}, 30_000).unref();
