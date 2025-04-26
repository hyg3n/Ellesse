// models/chatsModel.js

const pool = require("../config/database");

// Get existing chat between two users (ensures user1_id < user2_id for uniqueness)
const findChatBetweenUsers = async (user1_id, user2_id) => {
  const [a, b] =
    user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];
  const { rows } = await pool.query(
    `SELECT * FROM chats WHERE user1_id = $1 AND user2_id = $2`,
    [a, b]
  );
  return rows[0];
};

// Create new chat if one doesn't exist
const createChatBetweenUsers = async (user1_id, user2_id) => {
  const [a, b] =
    user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];
  const { rows } = await pool.query(
    `INSERT INTO chats (user1_id, user2_id) VALUES ($1,$2) RETURNING *`,
    [a, b]
  );
  return rows[0];
};

//Get just the meta (other user id + name) for a chat
const getChatMeta = async (chat_id, currentUserId) => {
  const chat = (
    await pool.query(`SELECT user1_id, user2_id FROM chats WHERE id = $1`, [
      chat_id,
    ])
  ).rows[0];
  if (!chat) return null;

  const otherId =
    chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
  const {
    rows: [u],
  } = await pool.query(`SELECT id, name FROM users WHERE id = $1`, [otherId]);

  return { otherUserId: otherId, otherUserName: u.name };
};

//Thread list (used by Messages screen)
const getThreadSummaries = async (userId) => {
    // grab all chats involving the user
    const chats = (
      await pool.query(
        `SELECT id,
                user1_id,
                user2_id,
                CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END AS other_id
           FROM chats
          WHERE user1_id = $1 OR user2_id = $1`,
        [userId]
      )
    ).rows;
  
    return Promise.all(
      chats.map(async (c) => {
        /* other user */
        const {
          rows: [other],
        } = await pool.query(`SELECT name FROM users WHERE id = $1`, [c.other_id]);
  
        /* last message */
        const {
          rows: [last],
        } = await pool.query(
          `SELECT message, created_at
             FROM messages
            WHERE chat_id = $1
         ORDER BY created_at DESC
            LIMIT 1`,
          [c.id]
        );
  
        /* relationship flags */
        const {
          rows: [clientFlag],
        } = await pool.query(
          `SELECT COUNT(*)::int > 0 AS is_client
             FROM bookings
            WHERE user_id = $1          -- I booked them
              AND provider_id = $2`,
          [userId, c.other_id]
        );
  
        const {
          rows: [providerFlag],
        } = await pool.query(
          `SELECT COUNT(*)::int > 0 AS is_provider
             FROM bookings
            WHERE user_id = $2          -- they booked me
              AND provider_id = $1`,
          [userId, c.other_id]
        );
  
        return {
          id: c.id,
          otherUserId: c.other_id,
          otherUserName: other.name,
          lastMessage: last?.message || '',
          lastMessageAt: last?.created_at,
          isClient: clientFlag.is_client,
          isProvider: providerFlag.is_provider,
        };
      })
    );
  };
  

module.exports = {
  findChatBetweenUsers,
  createChatBetweenUsers,
  getChatMeta,
  getThreadSummaries,
};

