// utils/jwt.js
const jwt  = require('jsonwebtoken');
const pool = require('../config/database');

exports.issueAccessToken = async (userId) => {
  // Fetch the latest role, name, and avatar URL for the user
  const { rows } = await pool.query(
    'SELECT role, name, avatar_url FROM users WHERE id = $1',
    [userId]
  );
  const { role, name, avatar_url: avatar } = rows[0];

  // Sign a token that includes id, role, name, and avatar
  return jwt.sign(
    { id: userId, role, name, avatar },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
