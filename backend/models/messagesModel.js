// models/messagesModel.js

const pool = require('../config/database');

const storeMessage = async ({ booking_id, sender_id, receiver_id, message, client_id }) => {
  const query = `
    INSERT INTO messages (booking_id, sender_id, receiver_id, message, client_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [booking_id, sender_id, receiver_id, message, client_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};


const getMessagesByBooking = async (booking_id) => {
  const query = `
    SELECT * FROM messages
    WHERE booking_id = $1
    ORDER BY created_at DESC;  -- Latest messages first
  `;
  const { rows } = await pool.query(query, [booking_id]);
  return rows;
};


module.exports = { storeMessage, getMessagesByBooking };
