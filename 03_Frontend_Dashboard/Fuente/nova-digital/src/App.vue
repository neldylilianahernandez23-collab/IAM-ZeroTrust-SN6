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

    <!-- 3. Usuario AUTENTICADO -> Layout Principal con Slot de Navegación -->
    <MainLayout v-else-if="isAuthenticated" #default="{ currentTab }">
      <!-- Vista 1: Dashboard -->
      <DashboardView v-if="currentTab === 'dashboard'" />

     <!-- Vista 2: Usuarios -->
    <UsersManager v-else-if="currentTab === 'usuarios'" />

      <!-- Vista 3: Actividad (Marcador de posición / Futuro componente) -->
      <div v-else-if="currentTab === 'actividad'" class="p-6 bg-white rounded-lg border border-[#c4c6cf]">
        <h2 class="text-2xl font-bold text-[#000613] mb-2">Registro de Actividad</h2>
        <p class="text-xs text-[#43474e]">Historial detallado de logs y auditorías del sistema.</p>
      </div>
    </MainLayout>

    <!-- 4. Control de errores -->
    <div v-if="error" class="error-state">
      <p>Ocurrió un error: {{ error.message }}</p>
      <button class="btn-login" @click="loginWithRedirect()">Reintentar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import MainLayout from './components/layout/MainLayout.vue'
import DashboardView from './components/dashboard/DashboardView.vue'
import UsersManager from './components/users/UsersManager.vue' // <--- IMPORTAR AQUÍ
const {
  isLoading,
  isAuthenticated,
  error,
  loginWithRedirect
} = useAuth0()
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