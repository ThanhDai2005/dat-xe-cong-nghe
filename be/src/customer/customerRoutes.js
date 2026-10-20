const express = require("express");
const { requireAuth } = require("../middlewares/authMiddleware");
const {
  createBookingHandler,
  processPaymentHandler,
} = require("./customerController");
const catalogController = require("./catalogController");

const router = express.Router();

router.get("/routes/search", catalogController.listRoutes);
router.get("/booking-types", catalogController.listBookingTypes);
router.get("/trips/search", catalogController.listTrips);
router.get("/trips/:id/seats", catalogController.getTripSeats);
router.get("/trips/:id", catalogController.getTripDetail);
router.get("/bookings/:id", requireAuth, catalogController.getBookingDetail);
router.post("/bookings", requireAuth, createBookingHandler);
router.post("/payments/process", requireAuth, processPaymentHandler);

module.exports = router;
