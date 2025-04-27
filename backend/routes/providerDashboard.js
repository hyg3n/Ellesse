// routes/providerDashboard.js
const express = require('express');
const authenticateUser = require('../middlewares/authMiddleware');
const { getDashboard } = require('../controllers/providerDashboardController');
const router = express.Router();

router.get('/dashboard', authenticateUser, getDashboard);

module.exports = router;
