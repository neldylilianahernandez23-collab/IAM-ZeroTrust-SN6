require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { auth, claimCheck } = require('express-oauth2-jwt-bearer');

// Importaciones de base de datos y utilidades (declaradas una sola vez)
const pool = require('./db');
const { logEvent } = require('./logger');

const app = express();
const PORT = process.env.PORT || 4000;

// --- MIDDLEWARES GENERALES ---
app.use(cors());
app.use(express.json());

// --- MIDDLEWARE DE TRAZABILIDAD Y MONITOREO ---
app.use((req, res, next) => {
  // Generar o capturar ID de trazabilidad único (Trace ID)
  req.traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  req.startTime = Date.now();

  // Devolver el Trace ID en la cabecera de respuesta para el cliente / frontend
  res.setHeader('X-Trace-ID', req.traceId);

  // Evento al finalizar la respuesta para monitorear rendimiento (Latency/Status)
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`[TRACE: ${req.traceId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// 1. Validador de JWT de Auth0
const validateJWT = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// 2. Middleware para permisos RBAC / Scopes M2M
const requirePermission = (requiredPermission) => {
  return claimCheck((claims) => {
    const userScopes = claims.scope ? claims.scope.split(' ') : [];
    return userScopes.includes(requiredPermission);
  });
};

// --- RUTA PÚBLICA DE PRUEBA ---
app.get('/api/public', (req, res) => {
  res.json({ 
    message: "Welcome to Universidad Nova Digital public directory." 
  });
});

// --- ENDPOINT DE SALUD Y MONITOREO (HEALTHCHECK) ---
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    uptime: process.uptime(), // Tiempo activo del servidor en segundos
    timestamp: new Date().toISOString(),
    trace_id: req.traceId,
    checks: {
      database: 'UNKNOWN'
    },
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    }
  };

  try {
    // Verificar conectividad con MySQL mediante una consulta ligera
    await pool.query({ sql: 'SELECT 1', timeout: 3000 });
    healthCheck.checks.database = 'UP';
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.status = 'ERROR';
    healthCheck.checks.database = 'DOWN';
    healthCheck.databaseError = error.message;
    res.status(503).json(healthCheck);
  }
});

// --- RUTAS PROTEGIDAS / PERFIL ---
app.get('/api/profile', validateJWT, async (req, res) => {
  try {
    await logEvent("TOKEN_VALIDATED", req.auth.payload.sub, "Acceso a perfil protegido", req.ip, { trace_id: req.traceId });
    res.json({ 
      message: "Access granted. This is your secure profile data.", 
      user: req.auth.payload 
    });
  } catch (error) {
    console.error("Error en /api/profile:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// --- RUTAS DE ADMINISTRACIÓN Y AUDITORÍA ---
app.get('/api/admin/settings', validateJWT, requirePermission('admin:all'), (req, res) => {
  res.json({ 
    message: "Access granted. Welcome, System Administrator via Machine Token." 
  });
});

app.get('/audit-logs', validateJWT, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error("Error consultando logs:", error);
    res.status(500).json({ error: "Error al obtener los registros de auditoría" });
  }
});

// --- RUTAS DE BASE DE DATOS (ROLES) ---
app.get('/roles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM roles');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener roles' });
  }
});

app.post('/roles', async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query('INSERT INTO roles (name) VALUES (?)', [name]);

    await logEvent("ROLE_CREATE", req.auth?.payload?.sub || null, `Rol creado: ${name}`, req.ip, { role_id: result.insertId, role_name: name, trace_id: req.traceId });

    res.json({ id: result.insertId, name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear rol' });
  }
});

// --- RUTAS DE BASE DE DATOS (PERFILES) ---
app.get('/profiles', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.username, p.email, r.name AS role
      FROM profiles p
      LEFT JOIN roles r ON p.role_id = r.id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener perfiles' });
  }
});

app.post('/profiles', async (req, res) => {
  try {
    const { username, email, role_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO profiles (username, email, role_id) VALUES (?, ?, ?)',
      [username, email, role_id]
    );
    res.json({ id: result.insertId, username, email, role_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear perfil' });
  }
});

app.put('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role_id } = req.body;

    await pool.query('UPDATE profiles SET username=?, email=?, role_id=? WHERE id=?',
      [username, email, role_id, id]);

    await logEvent("PROFILE_UPDATE", req.auth?.payload?.sub || null, `Perfil actualizado: ${id}`, req.ip, { trace_id: req.traceId });

    res.json({ message: "Perfil actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
});

// --- MANEJO CENTRALIZADO DE ERRORES ---
app.use(async (err, req, res, next) => {
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    console.error("❌ Auth0 Validation Failed! Reason:", err.message);
    
    // Intenta registrar el fallo en los logs si está disponible la función
    try {
      await logEvent("AUTH_ERROR", null, `Token inválido: ${err.message}`, req.ip, { trace_id: req.traceId, endpoint: req.originalUrl });
    } catch (logErr) {
      console.error("Error registrando log de auditoría:", logErr);
    }

    return res.status(401).json({ 
      error: "Unauthorized", 
      reason: err.message 
    });
  }
  next(err);
});

// --- INICIALIZACIÓN DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Server running smoothly on http://localhost:${PORT}`);
});