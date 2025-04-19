// routes/messages.js
const express = require('express');
const router = express.Router();
const { getMessagesByBooking } = require('../models/messagesModel');
const authenticateUser = require('../middlewares/authMiddleware');

// GET /api/messages?booking_id=...
router.get('/', authenticateUser, async (req, res) => {
  const { booking_id } = req.query;
  if (!booking_id) {
    return res.status(400).json({ error: 'Missing booking_id parameter' });
  }
  try {
    const messages = await getMessagesByBooking(booking_id);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
