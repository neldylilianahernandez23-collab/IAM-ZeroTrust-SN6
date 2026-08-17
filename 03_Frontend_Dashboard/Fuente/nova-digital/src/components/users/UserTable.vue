<template>
  <div v-if="loading" class="flex justify-center p-8 text-xs font-semibold text-[#43474e]">
    Cargando usuarios desde Auth0...
  </div>

  <div v-else-if="!users || users.length === 0" class="p-8 text-center text-xs text-[#43474e]">
    No se encontraron usuarios registrados.
  </div>

  <div
    v-else
    class="overflow-x-auto rounded-xl border border-[#c4c6cf] bg-white shadow-sm"
  >
    <table class="w-full text-left text-sm">
      <thead class="bg-[#e5eeff] text-xs uppercase text-[#43474e]">
        <tr>
          <th class="px-6 py-3">Usuario</th>
          <th class="px-6 py-3">Rol</th>
          <th class="px-6 py-3">Estado</th>
          <th class="px-6 py-3">Última Conexión</th>
          <th class="px-6 py-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#c4c6cf]/70">
        <tr
          v-for="user in users"
          :key="user.user_id"
          class="hover:bg-[#eff4ff] transition-colors"
        >
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <img
                :src="user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`"
                :alt="user.email"
                class="h-9 w-9 rounded-full object-cover border border-[#c4c6cf]"
              />
              <div>
                <p class="font-semibold text-[#000613]">
                  {{ user.name || user.email.split('@')[0] }}
                </p>
                <p class="text-xs text-[#43474e]">{{ user.email }}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <span
              class="inline-flex items-center rounded-full bg-[#eef2ff] px-2.5 py-0.5 text-xs font-semibold text-[#2f486a]"
            >
              {{ user.role || user.roles?.join(', ') || 'Sin rol' }}
            </span>
          </td>
          <td class="px-6 py-4">
            <span
              :class="[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                user.blocked
                  ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                  : 'bg-[#009969]/10 text-[#009969]'
              ]"
            >
              {{ user.blocked ? 'Bloqueado' : 'Activo' }}
            </span>
          </td>
          <td class="px-6 py-4 text-xs text-[#43474e] font-mono">
            {{ user.last_login ? new Date(user.last_login).toLocaleString() : 'Sin registros' }}
          </td>
          <td class="px-6 py-4 text-right">
            <button
              @click="$emit('deleteUser', user.user_id)"
              class="text-[#000613] hover:text-[#2f486a] font-semibold transition-colors"
              title="Eliminar usuario"
            >
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  users: any[];
  loading?: boolean;
}>()

defineEmits<{
  (e: 'deleteUser', userId: string): void;
}>()
</script>

