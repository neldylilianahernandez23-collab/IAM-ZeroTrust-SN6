<template>
  <main class="maintenance-container">
    <!-- 1. Pantalla de Carga -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando aplicación...</p>
    </div>

    <!-- 2. Pantalla de Mantenimiento / En Construcción -->
    <div v-else-if="isAuthenticated && user" class="maintenance-card">
      <!-- Logo institucional / de la App -->
      <div class="logo-container">
        <img 
          src="https://i.imgur.com/6Hu6uxt.png" 
          alt="Logo Universidad Nova Digital" 
          class="logo"
          width="200px"
          height="200px"
        />
      </div>

      <!-- Saludo personalizado -->
      <h1 class="welcome-title">
        Bienvenido, <span class="user-email">{{ user.email }}</span>
      </h1>

      <!-- Mensaje de Mantenimiento -->
      <p class="subtitle">Estamos trabajando en el dashboard.</p>

      <!-- Ilustración de sitio en construcción -->
      <div class="image-container">
        <img 
          src="@/assets/Back.jpg" 
          alt="Sitio en construcción" 
          class="construction-img"
        />
      </div>

      <!-- Botón de Cerrar Sesión Centrado -->
      <div class="actions">
        <button class="btn-logout" @click="logout">
          Cerrar Sesión
        </button>
      </div>
    </div>

    <!-- 3. Estado de Error -->
    <div v-else-if="error" class="error-state">
      <p>Ocurrió un error: {{ error.message }}</p>
      <button class="btn-logout" @click="loginWithRedirect()">Reintentar</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

const {
  isLoading,
  isAuthenticated,
  error,
  user,
  loginWithRedirect,
  logout: auth0Logout
} = useAuth0()

// Redirección automática si entra sin sesión
watch(
  isLoading,
  (loading) => {
    if (!loading && !isAuthenticated.value) {
      loginWithRedirect()
    }
  },
  { immediate: true }
)

const logout = () => {
  auth0Logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  })
}
</script>

<style scoped>
/* Contenedor Principal Centrado */
.maintenance-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 1.5rem;
  box-sizing: border-box;
}

/* Tarjeta Principal */
.maintenance-card {
  background: #ffffff;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 520px;
  width: 100%;
}

/* Logo */
.logo-container {
  margin-bottom: 1.2rem;
}

.logo {
  height: 70px;
  width: auto;
  object-fit: contain;
}

/* Títulos y Textos */
.welcome-title {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.user-email {
  color: #2b52b2;
  word-break: break-all;
}

.subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

/* Imagen de Construcción */
.image-container {
  margin: 1.5rem 0;
}

.construction-img {
  max-width: 260px;
  width: 100%;
  height: auto;
  object-fit: contain;
}

/* Acciones y Botones */
.actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn-logout {
  background-color: #dc3545;
  color: #ffffff;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.25);
}

.btn-logout:hover {
  background-color: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(220, 53, 69, 0.35);
}

.btn-logout:active {
  transform: translateY(0);
}

/* Indicador de Carga */
.loading-state {
  text-align: center;
  color: #6c757d;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #2b52b2;
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
}
</style>