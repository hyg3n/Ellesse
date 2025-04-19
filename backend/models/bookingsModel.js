// models/bookingsModel.js

const pool = require('../config/database'); // Make sure your pool is correctly exported

const createBooking = async ({ user_id, provider_id, description }) => {
  const query = `
    INSERT INTO bookings (user_id, provider_id, description, status)
    VALUES ($1, $2, $3, 'pending')
    RETURNING *;
  `;
  const values = [user_id, provider_id, description];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getBookingsByUser = async (user_id) => {
    // Joining with users table to get provider info (adjust as needed)
    const query = `
      SELECT b.*, u.name AS provider_name, u.email AS provider_email, u.phone_number AS provider_phone
      FROM bookings b
      JOIN users u ON b.provider_id = u.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC;
    `;
    const values = [user_id];
    const { rows } = await pool.query(query, values);
    return rows;
  };

module.exports = {
  createBooking,
  getBookingsByUser,
};