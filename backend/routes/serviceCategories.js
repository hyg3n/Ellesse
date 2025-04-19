// routes/serviceCategories.js
const express = require("express");
const router = express.Router();
const { fetchCategories } = require("../controllers/serviceCategoriesController");
const authenticateUser = require("../middlewares/authMiddleware");

// GET /api/service_categories
router.get("/", authenticateUser, fetchCategories);

module.exports = router;
