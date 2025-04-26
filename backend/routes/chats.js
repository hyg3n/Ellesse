// routes/chats.js
const express = require('express');
const router  = express.Router();
const authenticateUser = require('../middlewares/authMiddleware');

const {
  getChatMeta,            // returns { otherUserId, otherUserName }
  getThreadSummaries,     // returns full thread list with flags + last msg
  findChatBetweenUsers,
  createChatBetweenUsers,
} = require('../models/chatsModel');


// POST /api/chats/findOrCreateChat
router.post('/findOrCreateChat', authenticateUser, async (req, res) => {
  const user1 = req.user.id;
  const { otherUserId } = req.body;
  if (!otherUserId) return res.status(400).json({ error: 'otherUserId required' });

  try {
    let chat = await findChatBetweenUsers(user1, otherUserId);
    if (!chat) chat = await createChatBetweenUsers(user1, otherUserId);
    res.json({ chat });
  } catch (e) {
    console.error('findOrCreate error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/chats/:chatId/meta                                        
// Return the other participant’s id + name for one chat              
router.get('/:chatId/meta', authenticateUser, async (req, res) => {
  const chatId = Number(req.params.chatId);
  const userId = req.user.id;

  try {
    const meta = await getChatMeta(chatId, userId);
    if (!meta) return res.status(404).json({ error: 'Chat not found' });
    res.json(meta);
  } catch (err) {
    console.error('Meta fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chats?filter=all|client|provider|support                  
// List every thread for the logged-in user, including:               
//    - otherUserName                                                  
//    - lastMessage & timestamp                                        
//    - isClient  (I booked them)                                      
//    - isProvider (they booked me)                                    
router.get('/', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const filter = (req.query.filter || 'all').toLowerCase();

  try {
    // fetch every chat summary (model handles SQL + joins) 
    let threads = await getThreadSummaries(userId);

    //applying the filter flags
    if (filter === 'client')   threads = threads.filter(t => t.isClient);
    if (filter === 'provider') threads = threads.filter(t => t.isProvider);
    if (filter === 'support')  threads = [];             // placeholder

    // sort by most-recent activity 
    threads.sort(
      (a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
    );

    res.json(threads);
  } catch (err) {
    console.error('Error listing chats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
