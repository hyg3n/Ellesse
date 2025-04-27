// models/providerDashboardModel.js
const pool = require('../config/database');

/**
 * Returns the next upcoming “accepted” booking for this provider,
 * or null if there is none.
 */
async function getNextBookingForProvider(providerId) {
  const sql = `
    SELECT
      b.id               AS booking_id,
      b.scheduled_at     AS appointment_time,
      u.id               AS client_id,
      u.name             AS client_name,
      s.name             AS service_name,
      ps.price           AS service_price
    FROM bookings b
    JOIN provider_services ps
      ON ps.id = b.provider_service_id
    JOIN services s
      ON s.id  = ps.service_id
    JOIN users u
      ON u.id  = b.user_id
    WHERE ps.user_id      = $1
      AND b.status        = 'accepted'
      AND b.scheduled_at >= NOW()
    ORDER BY b.scheduled_at
    LIMIT 1
  `;
  const { rows } = await pool.query(sql, [providerId]);
  return rows[0] || null;
}

/**
 * Returns all “pending” booking requests for this provider.
 */
async function getPendingRequestsForProvider(providerId) {
  const sql = `
    SELECT
      b.id               AS booking_id,
      b.scheduled_at     AS appointment_time,
      u.id               AS client_id,
      u.name             AS client_name,
      s.name             AS service_name,
      ps.price           AS service_price
    FROM bookings b
    JOIN provider_services ps
      ON ps.id = b.provider_service_id
    JOIN services s
      ON s.id  = ps.service_id
    JOIN users u
      ON u.id  = b.user_id
    WHERE ps.user_id = $1
      AND b.status   = 'pending'
    ORDER BY b.scheduled_at
  `;
  const { rows } = await pool.query(sql, [providerId]);
  return rows;
}

/**
 * Returns an object { week_to_date, year_to_date } of completed
 * earnings for this provider, using CASE expressions only.
 */
async function getEarningsSummaryForProvider(providerId) {
  const sql = `
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN b.status = 'completed'
             AND b.scheduled_at >= date_trunc('year', CURRENT_DATE)
            THEN ps.price
            ELSE 0
          END
        ),
        0
      ) AS year_to_date,

      COALESCE(
        SUM(
          CASE
            WHEN b.status = 'completed'
             AND b.scheduled_at >= date_trunc('week', CURRENT_DATE)
            THEN ps.price
            ELSE 0
          END
        ),
        0
      ) AS week_to_date
    FROM bookings b
    JOIN provider_services ps
      ON ps.id = b.provider_service_id
    WHERE ps.user_id = $1
  `;
  const { rows } = await pool.query(sql, [providerId]);
  return rows[0];
}

module.exports = {
  getNextBookingForProvider,
  getPendingRequestsForProvider,
  getEarningsSummaryForProvider,
};
