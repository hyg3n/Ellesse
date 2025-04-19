// routes/providersByCategory.js
const express = require("express");
const router = express.Router();
const { fetchProvidersByCategory } = require("../controllers/providersByCategoryController");
const authenticateUser = require("../middlewares/authMiddleware");

router.get("/", authenticateUser, fetchProvidersByCategory);

module.exports = router;
