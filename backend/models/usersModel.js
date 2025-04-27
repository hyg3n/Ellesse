// models/usersModel.js
const pool = require('../config/database');

async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone_number, address, role
     FROM users
     WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function updateUserById(id, { name, email, phone_number, address }) {
  const sets = [];
  const vals = [];
  let idx = 1;
  if (name    != null) { sets.push(`name    = $${idx++}`); vals.push(name); }
  if (email   != null) { sets.push(`email   = $${idx++}`); vals.push(email); }
  if (phone_number != null) { sets.push(`phone_number = $${idx++}`); vals.push(phone_number); }
  if (address != null) { sets.push(`address = $${idx++}`); vals.push(address); }
  if (!sets.length) return getUserById(id);

  const { rows } = await pool.query(
    `UPDATE users
     SET ${sets.join(', ')}
     WHERE id = $${idx}
     RETURNING id, name, email, phone_number, address, role`,
    vals.concat(id)
  );
  return rows[0];
}

module.exports = { getUserById, updateUserById };
