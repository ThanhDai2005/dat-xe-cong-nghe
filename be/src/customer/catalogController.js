const catalog = require("./catalogService");

const wrap = (handler) => async (req, res, next) => {
  try {
    const data = await handler(req);
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listRoutes: wrap((req) => catalog.listRoutes(req.query)),
  listBookingTypes: wrap(() => catalog.listBookingTypes()),
  listTrips: wrap((req) => catalog.listTrips(req.query)),
  getTripDetail: wrap((req) => catalog.getTripDetail(req.params.id)),
  getTripSeats: wrap((req) => catalog.getTripSeats(req.params.id)),
  getBookingDetail: wrap((req) => catalog.getBookingDetail(req.params.id, req.user.sub)),
};
