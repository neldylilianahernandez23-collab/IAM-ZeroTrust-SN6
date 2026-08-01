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

// Helper para obtener Access Token M2M directamente si falla el SDK
async function getManagementApiToken() {
  const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
    })
  });
  const data = await response.json();
  return data.access_token;
}

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

// HELPER ROBUTSO: Intenta obtener roles via SDK y hace Fallback a HTTP Directo
async function getAuth0UserRoles(userId) {
  try {
    const encodedId = encodeURIComponent(userId);

    if (management.users && typeof management.users.getRoles === 'function') {
      const res = await management.users.getRoles({ id: userId });
      const roles = res.data || res;
      if (Array.isArray(roles) && roles.length > 0) return roles;
    }

    if (management.roles && typeof management.roles.getUserRoles === 'function') {
      const res = await management.roles.getUserRoles({ id: userId });
      const roles = res.data || res;
      if (Array.isArray(roles) && roles.length > 0) return roles;
    }

    const token = await getManagementApiToken();
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodedId}/roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok) {
      const directRoles = await response.json();
      return directRoles;
    }
  } catch (err) {
    console.error(`[ERROR Auth0 API] No se pudieron obtener roles para ${userId}:`, err.message);
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

    rolesList.forEach(r => {
      roleCounts[r.name] = 0;
    });

    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        if (user.blocked) {
          blockedUsers++;
        } else {
          activeUsers++;
        }

        const idToQuery = user.user_id || user.id;
        const assignedRoles = await getAuth0UserRoles(idToQuery);
        return Array.isArray(assignedRoles) ? assignedRoles.map(r => r.name) : [];
      })
    );

    usersWithRoles.forEach(userRoles => {
      userRoles.forEach(roleName => {
        const matchedKey = Object.keys(roleCounts).find(
          key => key.toLowerCase() === roleName.toLowerCase()
        );

        if (matchedKey) {
          roleCounts[matchedKey]++;
        } else {
          roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
        }
      });
    });

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
// DICCIONARIO DE TRADUCCIÓN DE CÓDIGOS AUTH0
// -------------------------------------------------------------
const AUTH0_ACTION_NAMES = {
  // Autenticaciones M2M y API
  seccft: 'Autenticación Servidor a Servidor (M2M)',
  sapi: 'Acceso a API de Administración',
  fapi: 'Acceso Denegado a API',
  
  // Inicios de Sesión
  s: 'Inicio de Sesión Exitoso',
  f: 'Fallo de Contraseña',
  fu: 'Usuario No Encontrado',
  fp: 'Bloqueo por IP Sospechosa',
  
  // Registro y Tokens
  ss: 'Inicio de Sesión Silencioso',
  scon: 'Usuario Registrado',
  fcon: 'Fallo al Registrar Usuario',
  seacft: 'Intercambio de Código por Token',
  feacft: 'Fallo al Solicitar Token',
  
  // MFA / Sesión
  mfa_failed: 'Fallo en Segundo Factor (MFA)',
  slo: 'Cierre de Sesión Exitoso'
};

// -------------------------------------------------------------
// ENDPOINT 2: Eventos, Logs y Alertas (CORREGIDO)
// -------------------------------------------------------------
app.get('/api/dashboard/logs', async (req, res) => {
  try {
    const rawLogs = await getAuth0Logs({ per_page: 50, sort: 'date:-1' });

    const recentEvents = rawLogs.map(log => {
      // Evento exitoso si el código empieza con 's'
      const isSuccess = log.type && log.type.toLowerCase().startsWith('s');

      // Nombre amigable según el tipo de código de Auth0
      const friendlyAction = AUTH0_ACTION_NAMES[log.type] 
        || log.type_name 
        || log.type 
        || 'Evento de Seguridad';

      return {
        id: log._id || log.log_id || Math.random().toString(),
        user: log.user_name || log.user_id || 'Usuario Anónimo',
        type: log.type,
        action: friendlyAction, // <-- Ahora enviará el texto descriptivo corto
        status: isSuccess ? 'PERMITIDO' : 'DENEGADO',
        reason: log.description || (isSuccess ? 'Operación realizada con éxito' : 'Acceso rechazado por políticas'),
        ip: log.ip || 'N/A',
        location: log.location_info?.country_code || 'N/A',
        date: log.date
      };
    });

    const failedLogins = rawLogs.filter(log => log.type && log.type.startsWith('f')).map(fail => ({
      id: fail._id || fail.log_id,
      user: fail.user_name || fail.user_id || 'Usuario Desconocido',
      ip: fail.ip || 'Desconocida',
      reason: fail.description || 'Fallo de autenticación',
      date: fail.date
    }));

    const adminAudits = rawLogs.filter(log => {
      const desc = (log.description || '').toLowerCase();
      return log.type === 'sapi' || desc.includes('role') || desc.includes('user') || desc.includes('update');
    }).map(audit => ({
      id: audit._id || audit.log_id,
      action: audit.type_name || 'Modificación de Sistema',
      details: audit.description || 'Cambio registrado en la plataforma',
      date: audit.date
    }));

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



// -------------------------------------------------------------
// ENDPOINT 3: Metadata de Roles
// -------------------------------------------------------------
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await getAuth0Roles();
    const rolesMetadata = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description || 'Sin descripción'
    }));

    res.json({
      total: rolesMetadata.length,
      roles: rolesMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ENDPOINT 4: Listar Usuarios
// -------------------------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const users = await getAuth0Users();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ENDPOINT 5: CREAR USUARIO Y ASIGNAR ROL (NUEVO)
// -------------------------------------------------------------
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, given_name, family_name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'El email y la contraseña son requeridos' });
    }

    // 1. Crear el usuario en Auth0
    let newUser;
    if (management.users && typeof management.users.create === 'function') {
      const response = await management.users.create({
        email,
        password,
        connection: 'Username-Password-Authentication',
        given_name,
        family_name,
        name: given_name && family_name ? `${given_name} ${family_name}` : email
      });
      newUser = response.data || response;
    } else {
      const token = await getManagementApiToken();
      const createRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          connection: 'Username-Password-Authentication',
          given_name,
          family_name,
          name: given_name && family_name ? `${given_name} ${family_name}` : email
        })
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.message || 'Error al crear el usuario en Auth0');
      }
      newUser = await createRes.json();
    }

    // 2. Si se especificó un rol, buscar su ID y asignarlo
    if (role && newUser.user_id) {
      const rolesList = await getAuth0Roles();
      const matchedRole = rolesList.find(r => r.name.toLowerCase() === role.toLowerCase());

      if (matchedRole) {
        const encodedUserId = encodeURIComponent(newUser.user_id);
        
        if (management.users && typeof management.users.assignRoles === 'function') {
          await management.users.assignRoles({ id: newUser.user_id }, { roles: [matchedRole.id] });
        } else {
          const token = await getManagementApiToken();
          await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodedUserId}/roles`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roles: [matchedRole.id] })
          });
        }
      }
    }

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ENDPOINT 6: ELIMINAR USUARIO (NUEVO)
// -------------------------------------------------------------
app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const encodedUserId = encodeURIComponent(userId);

    if (management.users && typeof management.users.delete === 'function') {
      await management.users.delete({ id: userId });
    } else {
      const token = await getManagementApiToken();
      const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodedUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al eliminar usuario en Auth0');
      }
    }

    res.json({ message: 'Usuario eliminado con éxito', userId });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
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