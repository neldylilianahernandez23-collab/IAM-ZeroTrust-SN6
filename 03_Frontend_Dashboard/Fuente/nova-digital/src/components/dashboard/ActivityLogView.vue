<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-3xl font-bold text-[#000613]">Registro de Actividad</h2>
        <p class="text-xs text-[#43474e]">Historial detallado de logs y auditorías del sistema.</p>
      </div>

      <button
        @click="fetchActivityData"
        class="flex items-center gap-2 bg-[#000613] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#2f486a] transition-colors"
      >
        <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': isLoading }">refresh</span>
        Actualizar
      </button>
    </header>

    <div v-if="isLoading" class="py-12 text-center text-xs font-bold text-[#43474e]">
      Obteniendo registros de actividad...
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white border border-[#c4c6cf] rounded-lg p-4">
          <p class="text-[10px] uppercase tracking-[0.2em] text-[#43474e]">Total</p>
          <p class="mt-3 text-3xl font-bold text-[#000613]">{{ stats.total }}</p>
        </div>

        <div class="bg-white border border-[#c4c6cf] rounded-lg p-4">
          <p class="text-[10px] uppercase tracking-[0.2em] text-[#43474e]">Permitidos</p>
          <p class="mt-3 text-3xl font-bold text-[#009969]">{{ stats.successful }}</p>
        </div>

        <div class="bg-white border border-[#c4c6cf] rounded-lg p-4">
          <p class="text-[10px] uppercase tracking-[0.2em] text-[#43474e]">Denegados</p>
          <p class="mt-3 text-3xl font-bold text-[#ba1a1a]">{{ stats.denied }}</p>
        </div>
      </div>

      <section class="bg-white border border-[#c4c6cf] rounded-lg overflow-hidden">
        <div class="p-6 flex items-center justify-between bg-[#eff4ff] border-b border-[#c4c6cf]">
          <h3 class="text-lg font-bold text-[#000613]">Historial de seguridad</h3>
          <span class="text-[10px] bg-[#000613] text-white px-2 py-1 rounded font-bold uppercase tracking-tight">
            {{ stats.uniqueUsers }} usuarios
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#e5eeff] text-[#43474e] border-b border-[#c4c6cf]">
                <th class="px-6 py-3 text-xs font-semibold uppercase">Usuario</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase">Acción</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase">Resultado</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase">Origen</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase">IP</th>
                <th class="px-6 py-3 text-xs font-semibold uppercase">Fecha</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-[#c4c6cf]/50 text-xs">
              <tr v-for="item in activity" :key="item.id" class="hover:bg-[#eff4ff] transition-colors align-top">
                <td class="px-6 py-3">
                  <div class="font-semibold text-[#000613]">{{ item.user || 'Usuario Anónimo' }}</div>
                  <div class="text-[10px] text-[#43474e]">{{ item.location || 'N/A' }}</div>
                </td>

                <td class="px-6 py-3 text-[#000613]">
                  <div class="font-semibold uppercase">{{ item.action || item.type }}</div>
                  <div class="text-[10px] text-[#43474e] max-w-[220px]">{{ item.details }}</div>
                </td>

                <td class="px-6 py-3">
                  <span
                    :class="item.status === 'Permitido' ? 'bg-[#009969]/10 text-[#009969]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'"
                    class="px-2 py-1 rounded-full text-[10px] font-bold"
                  >
                    {{ item.status }}
                  </span>
                </td>

                <td class="px-6 py-3 text-[#43474e]">{{ item.source || 'Auth0' }}</td>
                <td class="px-6 py-3 text-[#43474e] font-mono">{{ item.ip || 'N/A' }}</td>
                <td class="px-6 py-3 text-[#43474e] font-mono">{{ formatDate(item.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isLoading = ref(true)
const activity = ref<any[]>([])
const stats = ref({
  total: 0,
  successful: 0,
  denied: 0,
  uniqueUsers: 0
})

const fetchActivityData = async () => {
  isLoading.value = true

  try {
    const response = await fetch('http://localhost:3000/api/activity')
    if (!response.ok) {
      throw new Error('No se pudo cargar el registro de actividad')
    }

    const data = await response.json()
    activity.value = data.activity || []
    stats.value = data.stats || { total: 0, successful: 0, denied: 0, uniqueUsers: 0 }
  } catch (error) {
    console.error('Error cargando historial de actividad:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchActivityData()
})
</script>
