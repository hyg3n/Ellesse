// routes/becomeProvider.js
const express = require('express');
const authenticateUser = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { becomeProvider } = require('../controllers/providerOnboardingController');

const router = express.Router();

router.post(
  '/',
  authenticateUser,
  body('services').isArray({ min: 1 }),
  body('services.*.service_id').isInt(),
  body('services.*.experience').isInt({ min: 0 }),
  body('services.*.price').isFloat({ min: 5, max: 100 }),
  body('services.*.availability').isArray(),
  becomeProvider
);

module.exports = router;
