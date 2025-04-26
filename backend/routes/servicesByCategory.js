// routes/servicesByCategory.js
const express = require("express");
const router = express.Router();
const { getServicesByCategory } = require("../controllers/servicesByCategoryController");
const authenticateUser = require("../middlewares/authMiddleware");

router.get("/", authenticateUser, getServicesByCategory);

module.exports = router;
