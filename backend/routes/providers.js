// routes/providers.js

const express = require("express");
const { query } = require("express-validator");
const { getProviders } = require("../controllers/providersController");
const authenticateUser = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateUser,  // check if user is authenticated
  [
    query("service_name")
      .exists().withMessage("Service query parameter is required")
      .isString().withMessage("Service must be a string")
      .trim()
      .notEmpty().withMessage("Service cannot be empty")
      .isLength({ max: 50 }).withMessage("Service must be at most 50 characters long"),
  ],
  getProviders  // fetch providers if all checks pass
);

module.exports = router;
