<template>
  <div class="min-h-screen">
    <!-- 1. Carga de estado -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando aplicación...</p>
    </div>

    <!-- 2. Usuario NO autenticado (Landing) -->
    <main v-else-if="!isAuthenticated" class="welcome-container">
      <div class="welcome-card">
        <div class="logo-container">
          <img 
            src="https://i.imgur.com/6Hu6uxt.png" 
            alt="Logo Universidad Nova Digital" 
            class="logo"
          />
        </div>

        <h1 class="welcome-title">
          Bienvenido a Universidad Nova Digital
        </h1>

        <p class="subtitle">
          Consola IAM & Control Zero Trust
        </p>

        <div class="actions">
          <button class="btn-login" @click="loginWithRedirect()">
            Iniciar Sesión
          </button>
        </div>
      </div>
    </main>

    <!-- 3. Usuario AUTENTICADO: docente o estudiante -->
    <MainLayout
      v-else-if="isAuthenticated && isStudentOrTeacher"
      is-welcome-mode
      #default
    >
      <WelcomePage
        :role-name="roleLabel"
        :user-name="userDisplayName"
      />
    </MainLayout>

    <!-- 4. Usuario AUTENTICADO -> Layout Principal con Slot de Navegación -->
    <MainLayout v-else-if="isAuthenticated" #default="{ currentTab }">
      <!-- Vista 1: Dashboard -->
      <DashboardView v-if="currentTab === 'dashboard'" />

      <!-- Vista 2: Usuarios -->
      <UsersManager v-else-if="currentTab === 'usuarios'" />

      <!-- Vista 3: Actividad -->
      <ActivityLogView v-else-if="currentTab === 'actividad'" />
    </MainLayout>

    <!-- 5. Control de errores -->
    <div v-if="error" class="error-state">
      <p>Ocurrió un error: {{ error.message }}</p>
      <button class="btn-login" @click="loginWithRedirect()">Reintentar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import MainLayout from './components/layout/MainLayout.vue'
import DashboardView from './components/dashboard/DashboardView.vue'
import UsersManager from './components/users/UsersManager.vue'
import ActivityLogView from './components/dashboard/ActivityLogView.vue'
import WelcomePage from './components/dashboard/welcome_page.vue'

const {
  isLoading,
  isAuthenticated,
  error,
  loginWithRedirect,
  user,
  getAccessTokenSilently
} = useAuth0()

const sessionRoles = ref<string[]>([])
const sessionRoleLabel = ref('Usuario')

const loadSessionRole = async () => {
  if (!isAuthenticated.value) {
    sessionRoles.value = []
    sessionRoleLabel.value = 'Usuario'
    return
  }

  try {
    const token = await getAccessTokenSilently()
    const response = await fetch('http://localhost:3000/api/auth/session', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('No se pudo obtener la sesión del usuario')
    }

    const data = await response.json()
    sessionRoles.value = Array.isArray(data.roles) ? data.roles : []
    sessionRoleLabel.value = data.roleLabel || 'Usuario'
  } catch (err) {
    console.error('Error cargando la sesión del usuario:', err)
    sessionRoles.value = []
    sessionRoleLabel.value = 'Usuario'
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadSessionRole()
  }
})

watch(isAuthenticated, (value) => {
  if (value) {
    loadSessionRole()
  }
}, { immediate: true })

const rawRoles = computed(() => {
  const rolesFromUser =
    user.value?.roles ??
    user.value?.role ??
    user.value?.['https://novadigital.edu.sv/roles'] ??
    user.value?.['https://novadigital.edu.sv/role'] ??
    user.value?.['https://nova-digital/roles'] ??
    user.value?.['https://nova-digital/role'] ??
    user.value?.app_metadata?.role ??
    user.value?.['app_metadata']?.role

  const roles = sessionRoles.value.length > 0 ? sessionRoles.value : rolesFromUser

  if (Array.isArray(roles)) return roles
  if (typeof roles === 'string') return [roles]
  return []
})

const roleLabel = computed(() => {
  const normalized = rawRoles.value.map(role => String(role).trim())

  if (normalized.some(role => /docente|teacher/i.test(role))) return 'Docente'
  if (normalized.some(role => /alumno|estudiante|student/i.test(role))) return 'Estudiante'

  return sessionRoleLabel.value || 'Usuario'
})

const isStudentOrTeacher = computed(() => {
  const normalized = rawRoles.value.map(role => String(role).toLowerCase())
  return normalized.some(role => /(docente|teacher|alumno|estudiante|student)/i.test(role))
})

const userDisplayName = computed(() => {
  return user.value?.name || user.value?.given_name || user.value?.email || 'Usuario'
})
</script>

<style scoped>
/* Estilos para cuando no está autenticado */
.welcome-container {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

.welcome-card {
  background: #ffffff;
  padding: 3rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 520px;
  width: 100%;
  margin: 4rem auto;
}

.logo-container {
  margin-bottom: 1.8rem;
}

.logo {
  height: 180px;
  width: auto;
  margin: 0 auto;
  object-fit: contain;
}

.welcome-title {
  font-size: 1.75rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-weight: 700;
  line-height: 1.25;
}

.subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin-top: 0;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  justify-content: center;
}

.btn-login {
  background-color: #001f3f;
  color: #ffffff;
  border: none;
  padding: 0.85rem 2.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 31, 63, 0.25);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;
}

.btn-login:hover {
  background-color: #001429;
  transform: translateY(-1px);
}

.loading-state {
  text-align: center;
  color: #6c757d;
  padding-top: 5rem;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #001f3f;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  color: #721c24;
  background-color: #f8d7da;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 400px;
  margin: 2rem auto;
}
</style>