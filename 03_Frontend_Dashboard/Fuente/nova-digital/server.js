import express from 'express';
import cors from 'cors';
import { ManagementClient } from 'auth0';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar cliente de Auth0 Management
const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_M2M_CLIENT_ID,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
});

// Helpers para compatibilidad v3/v4 SDK
async function getAuth0Users() {
  if (management.users && typeof management.users.getAll === 'function') {
    const res = await management.users.getAll();
    return res.data || res;
  }
  if (management.users && typeof management.users.list === 'function') {
    const res = await management.users.list();
    return res.data || res;
  }
  if (typeof management.getUsers === 'function') {
    const res = await management.getUsers();
    return res.data || res;
  }
  return [];
}

async function getAuth0Roles() {
  if (management.roles && typeof management.roles.getAll === 'function') {
    const res = await management.roles.getAll();
    return res.data || res;
  }
  if (management.roles && typeof management.roles.list === 'function') {
    const res = await management.roles.list();
    return res.data || res;
  }
  if (typeof management.getRoles === 'function') {
    const res = await management.getRoles();
    return res.data || res;
  }
  return [];
}

async function getAuth0Logs(params = { per_page: 50, sort: 'date:-1' }) {
  if (management.logs && typeof management.logs.getAll === 'function') {
    const res = await management.logs.getAll(params);
    return res.data || res;
  }
  if (management.logs && typeof management.logs.list === 'function') {
    const res = await management.logs.list(params);
    return res.data || res;
  }
  if (typeof management.getLogs === 'function') {
    const res = await management.getLogs();
    return res.data || res;
  }
  return [];
}

// -------------------------------------------------------------
// ENDPOINT 1: Métricas de Usuarios y Distribución de Roles
// -------------------------------------------------------------
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [users, rolesList] = await Promise.all([
      getAuth0Users(),
      getAuth0Roles().catch(() => [])
    ]);

    const totalUsers = users.length;
    let activeUsers = 0;
    let blockedUsers = 0;
    const roleCounts = {};

    // Conteo por estado
    users.forEach(user => {
      if (user.blocked) {
        blockedUsers++;
      } else {
        activeUsers++;
      }

      // Si los roles vienen incrustados en user_metadata o app_metadata
      const userRoles = user.roles || user.app_metadata?.roles || [];
      userRoles.forEach(r => {
        roleCounts[r] = (roleCounts[r] || 0) + 1;
      });
    });

    // Si existen roles creados en la pestaña Roles de Auth0, aseguramos que aparezcan
    rolesList.forEach(r => {
      if (!roleCounts[r.name]) {
        roleCounts[r.name] = 0;
      }
    });

    // Si no hay asignación explícita, se agrupan en Sin Rol
    if (Object.keys(roleCounts).length === 0) {
      roleCounts['Usuarios Registrados'] = totalUsers;
    }

    const roleDistribution = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

    res.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      roleDistribution
    });
  } catch (error) {
    console.error('Error calculando estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ENDPOINT 2: Eventos, Intentos Fallidos, Auditorías y Alertas
// -------------------------------------------------------------
app.get('/api/dashboard/logs', async (req, res) => {
  try {
    const rawLogs = await getAuth0Logs({ per_page: 50, sort: 'date:-1' });

    // 1. Clasificación de Eventos Recientes de Acceso
    const recentEvents = rawLogs.map(log => {
      const isSuccess = log.type === 's' || log.type === 'sapi';
      return {
        id: log._id || log.log_id || Math.random().toString(),
        user: log.user_name || log.user_id || 'Usuario Anónimo',
        type: log.type,
        action: log.type_name || log.type || 'LOGIN',
        status: isSuccess ? 'PERMITIDO' : 'DENEGADO',
        reason: log.description || (isSuccess ? 'Autenticación exitosa' : 'Acceso rechazado por políticas'),
        ip: log.ip || 'N/A',
        location: log.location_info?.country_code || 'N/A',
        date: log.date
      };
    });

    // 2. Intentos Fallidos (códigos que inician con 'f')
    const failedLogins = rawLogs.filter(log => log.type && log.type.startsWith('f')).map(fail => ({
      id: fail._id || fail.log_id,
      user: fail.user_name || fail.user_id || 'Usuario Desconocido',
      ip: fail.ip || 'Desconocida',
      reason: fail.description || 'Fallo de autenticación',
      date: fail.date
    }));

    // 3. Auditoría de Cambios Administrativos ('sapi' o eventos de gestión)
    const adminAudits = rawLogs.filter(log => {
      const desc = (log.description || '').toLowerCase();
      return log.type === 'sapi' || desc.includes('role') || desc.includes('user') || desc.includes('update');
    }).map(audit => ({
      id: audit._id || audit.log_id,
      action: audit.type_name || 'Modificación de Sistema',
      details: audit.description || 'Cambio registrado en la plataforma',
      date: audit.date
    }));

    // 4. Alertas Zero Trust
    const zeroTrustAlerts = failedLogins.map(fail => ({
      id: fail.id,
      title: 'Intento de Acceso Denegado',
      user: fail.user,
      reason: fail.reason,
      date: fail.date
    }));

    res.json({
      recentEvents,
      failedLogins,
      adminAudits,
      zeroTrustAlerts
    });
  } catch (error) {
    console.error('Error calculando logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Compatibilidad
app.get('/api/users', async (req, res) => {
  try {
    const users = await getAuth0Users();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const logs = await getAuth0Logs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Servidor Backend corriendo en http://localhost:3000'));