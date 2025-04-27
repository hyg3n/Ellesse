// routes/providerServices.js
const express = require('express');
const { body, param } = require('express-validator');
const authenticateUser = require('../middlewares/authMiddleware');
const {
  listServices,
  updateService,
  deleteService,
} = require('../controllers/providerServicesController');

const router = express.Router();

// All routes require an authenticated provider
router.use(authenticateUser);

// GET   /api/provider/services      → list all their services
router.get('/', listServices);

// PUT   /api/provider/services/:id  → update one
router.put(
  '/:id',
  param('id').isInt(),
  body('price').optional().isFloat({ min: 0 }),
  body('experience').optional().isInt({ min: 0 }),
  body('availability').optional().isArray(),
  updateService
);

// DELETE /api/provider/services/:id → remove one
router.delete(
  '/:id',
  param('id').isInt(),
  deleteService
);

module.exports = router;
