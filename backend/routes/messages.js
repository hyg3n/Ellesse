const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/authMiddleware');
const {
  storeMessage,
  getMessagesByChatIdPaginated,
} = require('../models/messagesModel');

// paginated GET /api/messages/:chatId
router.get('/:chatId', authenticateUser, async (req, res) => {
  const chat_id = Number(req.params.chatId);
  const limit  = Number(req.query.limit)  || 20;
  const before = req.query.before ? new Date(req.query.before) : new Date();

  if (!chat_id || Number.isNaN(before.getTime())) {
    return res.status(400).json({ error: 'Invalid chatId or before param' });
  }

  try {
    const msgs = await getMessagesByChatIdPaginated(chat_id, before, limit);
    res.json(msgs);
  } catch (err) {
    console.error('Paginated fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages — send a new message
router.post('/', authenticateUser, async (req, res) => {
  const { chat_id, receiver_id, message, clientId, type } = req.body;
  if (!chat_id || !message) {
    return res.status(400).json({ error: 'chat_id and message required' });
  }
  try {
    const saved = await storeMessage({
      chat_id,
      sender_id: req.user.id,
      receiver_id,
      message,
      client_id: clientId,
      type: type || 'user',
    });
    res.status(201).json(saved);
  } catch (e) {
    console.error('Save message error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
