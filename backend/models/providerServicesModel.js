// models/providerServicesModel.js
const pool = require('../config/database');

async function addProviderServicesForUser(userId, services) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update the user’s role to include “provider”
    await client.query(
      `UPDATE users
         SET role = CASE
           WHEN role LIKE '%provider%' THEN role
           ELSE role || ',provider'
         END
       WHERE id = $1`,
      [userId]
    );

    // Insert a row into provider_services for each selected service
    const insertText = `
      INSERT INTO provider_services
        (user_id, service_id, price, experience, availability)
      VALUES ($1, $2, $3, $4, $5)
    `;
    for (const svc of services) {
      await client.query(insertText, [
        userId,
        svc.service_id,
        svc.price,
        svc.experience,
        JSON.stringify(svc.availability),
      ]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  addProviderServicesForUser,
};
