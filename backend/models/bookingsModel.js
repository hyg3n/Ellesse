// models/bookingsModel.js

const pool = require("../config/database"); // Make sure your pool is correctly exported

const createBooking = async ({
  user_id,
  provider_id,
  provider_service_id,
  description,
  scheduled_at,
  payment_intent_id,
}) => {
  const query = `
     INSERT INTO bookings
       (user_id, provider_id, provider_service_id, description, scheduled_at, status, payment_intent_id)
     VALUES
       ($1, $2, $3, $4, $5, 'pending', $6)
     RETURNING *;
   `;
  const values = [
    user_id,
    provider_id,
    provider_service_id,
    description,
    scheduled_at,
    payment_intent_id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getBookingsByUser = async (user_id) => {
  // Joining with users table to get provider info (adjust as needed)
  const query = `
      SELECT
        b.provider_id      AS provider_id,        
        b.id               AS booking_id,
        u.name             AS provider_name,
        u.email            AS provider_email,
        u.phone_number     AS provider_phone,
        s.name             AS service_name,
        ps.price           AS service_price,
        b.description,
        b.status,
        b.scheduled_at,
        b.created_at
      FROM bookings b
      JOIN provider_services ps
        ON ps.id = b.provider_service_id
      JOIN services s
        ON s.id = ps.service_id
      JOIN users u
        ON u.id = ps.user_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC;
    `;
  const values = [user_id];
  const { rows } = await pool.query(query, values);
  return rows;
};

async function updateBookingStatus(bookingId, providerId, newStatus) {
  const query = `
      UPDATE bookings
         SET status = $2
       WHERE id = $1
         AND provider_id = $3
         AND status = 'pending'
      RETURNING *;
    `;
  const values = [bookingId, newStatus, providerId];
  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

module.exports = {
  createBooking,
  getBookingsByUser,
  updateBookingStatus,
};
