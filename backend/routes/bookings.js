// routes/bookings.js

const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUser  } = require('../models/bookingsModel');
const authenticateUser = require('../middlewares/authMiddleware'); // Use your JWT middleware

// POST /api/bookings - Create a new booking request
router.post('/', authenticateUser, async (req, res) => {
  const { provider_id, description } = req.body;
  const user_id = req.user.id; // Provided by authenticateUser

  if (!provider_id) {
    return res.status(400).json({ error: 'Provider ID is required' });
  }

  try {
    const booking = await createBooking({ user_id, provider_id, description });
    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bookings - Retrieve bookings for the logged-in user
router.get('/', authenticateUser, async (req, res) => {
    const user_id = req.user.id;
    try {
      const bookings = await getBookingsByUser(user_id);
      res.json(bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
module.exports = router;
