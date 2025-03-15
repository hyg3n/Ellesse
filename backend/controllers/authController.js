const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const registerUser = async (req, res) => {
  const { name, email, phone_number, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await pool.query(
      "INSERT INTO users (name, email, phone_number, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role",
      [name, email, phone_number, hashedPassword, role]
    );

    res.status(201).json({ message: "User registered", user: newUser.rows[0] });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      // Compare passwords
      const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user.rows[0].id, role: user.rows[0].role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
  
      res.json({ message: "Login successful", token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  module.exports = { registerUser, loginUser };
  