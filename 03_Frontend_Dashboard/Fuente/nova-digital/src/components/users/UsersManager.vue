<template>
  <div v-if="authLoading" class="p-6 text-sm font-medium text-[#43474e]">
    Verificando sesión con Auth0...
  </div>

  <div v-else-if="!isAuthenticated" class="p-6 text-center text-[#ba1a1a] font-medium">
    Debes iniciar sesión para acceder a la gestión de usuarios.
  </div>

  <div v-else class="space-y-6 p-6 bg-[#f8f9ff] rounded-xl">
    <!-- Encabezado -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-3xl font-bold text-[#000613]">Gestión de Usuarios</h1>
        <p class="text-xs text-[#43474e] mt-1">
          Administra las cuentas registradas y sus roles en Auth0.
        </p>
      </div>
      <button
        @click="isModalOpen = true"
        class="rounded-lg bg-[#000613] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2f486a]"
      >
        + Nuevo Usuario
      </button>
    </div>

    <!-- Componente Tabla -->
    <UserTable
      :users="users"
      :loading="loading"
      @delete-user="handleDeleteUser"
    />

    <!-- Componente Formulario Modal -->
    <UserFormModal
      :is-open="isModalOpen"
      :available-roles="roles"
      @close="isModalOpen = false"
      @user-created="handleUserCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import UserTable from './UserTable.vue'
import UserFormModal from './UserFormModal.vue'

const { isAuthenticated, isLoading: authLoading } = useAuth0()

const users = ref<any[]>([])
const roles = ref<any[]>([])
const loading = ref(true)
const isModalOpen = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const [usersRes, rolesRes] = await Promise.all([
      fetch('http://localhost:3000/api/users'),
      fetch('http://localhost:3000/api/roles')
    ])

    if (usersRes.ok) {
      users.value = await usersRes.json()
    }

    if (rolesRes.ok) {
      const rolesData = await rolesRes.json()
      roles.value = rolesData.roles || []
    }
  } catch (err) {
    console.error('Error al cargar la información de usuarios:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const handleUserCreated = () => {
  fetchData()
}

const handleDeleteUser = async (userId: string) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario de Auth0?')) return

  try {
    const res = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      users.value = users.value.filter((u) => u.user_id !== userId)
    } else {
      alert('No se pudo eliminar el usuario')
    }
  } catch (err) {
    console.error('Error eliminando usuario:', err)
  }
}
</script>