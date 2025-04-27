// routes/bookings.js
const express = require("express");
const authenticateUser = require("../middlewares/authMiddleware");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const {
  createBooking,
  getBookingsByUser,
  updateBookingStatus,
} = require("../models/bookingsModel");

const router = express.Router();

// POST /api/bookings
router.post("/", authenticateUser, async (req, res) => {
  const {
    provider_id,
    provider_service_id,
    description,
    scheduled_at,
    payment_intent_id,
  } = req.body;
  const user_id = req.user.id;

  if (!provider_id) {
    return res.status(400).json({ error: "Provider ID is required" });
  }
  if (!scheduled_at) {
    return res.status(400).json({ error: "Scheduled time is required" });
  }

  try {
    const booking = await createBooking({
      user_id,
      provider_id,
      provider_service_id,
      description,
      scheduled_at,
      payment_intent_id,
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bookings
router.get("/", authenticateUser, async (req, res) => {
  try {
    const bookings = await getBookingsByUser(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/bookings/:id/accept
 * Transition a pending booking to "accepted" if it belongs to the logged-in provider.
 */
router.put("/:id/accept", authenticateUser, async (req, res) => {
  const providerId = req.user.id;
  const bookingId = Number(req.params.id);

  try {
    const updated = await updateBookingStatus(
      bookingId,
      providerId,
      "accepted"
    );
    if (!updated) {
      return res
        .status(404)
        .json({ error: "Booking not found, not pending, or not yours" });
    }
    // Capture the manual‐capture PaymentIntent ─
    if (updated.payment_intent_id) {
      await stripe.paymentIntents.capture(updated.payment_intent_id);
    }
    res.json(updated);
  } catch (err) {
    console.error("Error accepting booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/bookings/:id/decline
 * Transition a pending booking to "declined" if it belongs to the logged-in provider.
 */
router.put("/:id/decline", authenticateUser, async (req, res) => {
  const providerId = req.user.id;
  const bookingId = Number(req.params.id);

  try {
    const updated = await updateBookingStatus(
      bookingId,
      providerId,
      "declined"
    );
    if (!updated) {
      return res
        .status(404)
        .json({ error: "Booking not found, not pending, or not yours" });
    }
    // Cancel the manual‐capture PaymentIntent ─
    if (updated.payment_intent_id) {
      await stripe.paymentIntents.cancel(updated.payment_intent_id);
    }
    res.json(updated);
  } catch (err) {
    console.error("Error declining booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
