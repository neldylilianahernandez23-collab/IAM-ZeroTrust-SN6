const pool = require('./db');

async function logEvent(eventType, userId, description, ipAddress) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (event_type, user_id, description, ip_address) VALUES (?, ?, ?, ?)',
      [eventType, userId, description, ipAddress]
    );
  } catch (error) {
    console.error("Error registrando evento:", error);
  }
}

module.exports = { logEvent };
