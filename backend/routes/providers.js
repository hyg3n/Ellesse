const express = require("express");
const { query } = require("express-validator");
const { getProviders } = require("../controllers/providersController");

const router = express.Router();

router.get(
  "/",
  [
    query("service")
      .exists().withMessage("Service query parameter is required")
      .isString().withMessage("Service must be a string")
      .trim()
      .notEmpty().withMessage("Service cannot be empty")
      .isLength({ max: 50 }).withMessage("Service must be at most 50 characters long"),
  ],
  getProviders
);

module.exports = router;
