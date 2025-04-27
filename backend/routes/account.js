// routes/account.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/usersController');

router.get('/profile',   authenticate, getProfile);
router.put('/profile',   authenticate, updateProfile);

module.exports = router;
