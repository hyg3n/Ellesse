// models/messagesModel.js

const pool = require('../config/database');

// Store a new message
const storeMessage = async ({ chat_id, sender_id, receiver_id, message, client_id, type = 'user' }) => {
  const query = `
    INSERT INTO messages (chat_id, sender_id, receiver_id, message, client_id, type)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [chat_id, sender_id, receiver_id, message, client_id, type];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Fetch paginated messages for infinite scroll
const getMessagesByChatIdPaginated = async (chat_id, before, limit = 20) => {
  const query = `
    SELECT m.*, u.name AS sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.chat_id = $1 AND m.created_at < $2
    ORDER BY m.created_at DESC
    LIMIT $3;
  `;
  const { rows } = await pool.query(query, [chat_id, before, limit]);
  return rows;
};

module.exports = {
  storeMessage,
  getMessagesByChatIdPaginated,
};
