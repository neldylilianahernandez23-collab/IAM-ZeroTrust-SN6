<template>
  <div v-if="loading" class="flex justify-center p-8 text-slate-500">
    Cargando usuarios desde Auth0...
  </div>

  <div v-else-if="!users || users.length === 0" class="p-8 text-center text-slate-500">
    No se encontraron usuarios registrados.
  </div>

  <div
    v-else
    class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
  >
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
        <tr>
          <th class="px-6 py-3">Usuario</th>
          <!--th class="px-6 py-3">ID Auth0</th-->
          <th class="px-6 py-3">Estado</th>
          <th class="px-6 py-3">Última Conexión</th>
          <th class="px-6 py-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
        <tr
          v-for="user in users"
          :key="user.user_id"
          class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
        >
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <img
                :src="user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`"
                :alt="user.email"
                class="h-9 w-9 rounded-full object-cover"
              />
              <div>
                <p class="font-medium text-slate-800 dark:text-white">
                  {{ user.name || user.email.split('@')[0] }}
                </p>
                <p class="text-xs text-slate-500">{{ user.email }}</p>
              </div>
            </div>
          </td>
          <!--td class="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
            {{ user.user_id }}
          </td-->
          <td class="px-6 py-4">
            <span
              :class="[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                user.blocked
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              ]"
            >
              {{ user.blocked ? 'Bloqueado' : 'Activo' }}
            </span>
          </td>
          <td class="px-6 py-4 text-xs text-slate-500">
            {{ user.last_login ? new Date(user.last_login).toLocaleString() : 'Sin registros' }}
          </td>
          <td class="px-6 py-4 text-right">
            <button
              @click="$emit('deleteUser', user.user_id)"
              class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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

