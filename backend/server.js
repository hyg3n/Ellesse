const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const { Pool } = require("pg");
const { query, validationResult } = require("express-validator");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Adds security-related HTTP headers
app.use(cors()); // Enables CORS - adjust the configuration as needed
app.use(bodyParser.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test PostgreSQL connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err.stack);
  } else {
    console.log("Connected to PostgreSQL");
    release();
  }
});

// Routes

/**
 * GET /api/providers
 * Query Parameters:
 * - service (string) [required]: The type of service to search for providers.
 */
app.get(
  "/api/providers",
  [
    // Validation and Sanitization
    query('service')
      .exists().withMessage('Service query parameter is required')
      .bail()
      .isString().withMessage('Service must be a string')
      .bail()
      .trim()
      .notEmpty().withMessage('Service cannot be empty')
      .bail()
      .isLength({ max: 50 }).withMessage('Service must be at most 50 characters long'),
  ],
  async (req, res) => {
    // Handle validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { service } = req.query;

    try {
      const result = await pool.query(
        "SELECT * FROM providers WHERE LOWER(service) = LOWER($1)",
        [service]
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching providers:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// 404 Handler for Undefined Routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Backend API is running on http://localhost:${port}`);
});
