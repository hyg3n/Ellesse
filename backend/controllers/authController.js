const bcrypt = require("bcrypt");
const pool = require("../config/database");
const { issueAccessToken } = require("../utils/jwt");

const registerUser = async (req, res) => {
  const { name, email, phone_number, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
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
    // Fetch user record
    const { rows } = await pool.query(
      "SELECT id, name, email, password, avatar_url FROM users WHERE email = $1",
      [email]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const user = rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Issue a token that includes id, role, name, and avatar
    const token = await issueAccessToken(user.id);

    // Return token plus basic user info for immediate UI use
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar_url || undefined,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser };
