const pool = require('./db');

/**
 * Registra un evento de auditoría en la base de datos MySQL.
 * @param {string} eventType - Tipo de evento (ej. 'ROLE_CREATE', 'AUTH_ERROR')
 * @param {string|null} userId - ID de Auth0 (sub) o null si es anónimo/fallido
 * @param {string} description - Explicación legible del evento
 * @param {string} ipAddress - Dirección IP del cliente (req.ip)
 * @param {object|null} metadata - Objeto opcional con datos adicionales
 */
async function logEvent(eventType, userId, description, ipAddress, metadata = null) {
  try {
    const jsonMetadata = metadata ? JSON.stringify(metadata) : null;

    await pool.query(
      'INSERT INTO audit_logs (event_type, user_id, description, ip_address, metadata) VALUES (?, ?, ?, ?, ?)',
      [eventType, userId, description, ipAddress, jsonMetadata]
    );
  } catch (error) {
    console.error("Error registrando evento:", error);
  }
}

module.exports = { logEvent };