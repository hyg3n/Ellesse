const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const notFoundHandler = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Debugging: Check if JWT_SECRET is loaded
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter); 

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Backend API is running on http://localhost:${port}`);
});
