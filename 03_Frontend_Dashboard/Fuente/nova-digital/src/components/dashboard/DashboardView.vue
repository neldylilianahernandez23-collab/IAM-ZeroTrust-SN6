<template>
  <div>
    <header class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-[#000613]">Dashboard</h2>
        <p class="text-xs text-[#43474e]">Monitoreo en tiempo real desde Auth0 Management API.</p>
      </div>
      <button 
        @click="fetchDashboardData"
        class="flex items-center gap-2 bg-[#000613] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#2f486a] transition-colors"
      >
        <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': isLoading }">refresh</span>
        Actualizar
      </button>
    </header>

    <div v-if="isLoading" class="py-12 text-center text-xs font-bold text-[#43474e]">
      Obteniendo datos de Auth0...
    </div>

    <template v-else>
      <!-- 1. Métricas Principales -->
      <MetricsOverview 
        :active-users="stats.activeUsers"
        :total-users="stats.totalUsers"
        :blocked-users="stats.blockedUsers"
        :failed-attempts-count="logs.failedLogins.length"
        :active-alerts-count="logs.zeroTrustAlerts.length"
      />

      <!-- 2. Grid de Widgets -->
      <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-8 space-y-8">
          <RoleDistribution :role-distribution="stats.roleDistribution" />
          <RecentEventsTable :events="logs.recentEvents" :format-date="formatDate" />
        </div>

        <div class="col-span-12 lg:col-span-4 space-y-8">
          <ZeroTrustAlerts :alerts="logs.zeroTrustAlerts" :format-date="formatDate" />
          <AdminAudits :audits="logs.adminAudits" :format-date="formatDate" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import MetricsOverview from './MetricsOverview.vue'
import RoleDistribution from './RoleDistribution.vue'
import RecentEventsTable from './RecentEventsTable.vue'
import ZeroTrustAlerts from './ZeroTrustAlerts.vue'
import AdminAudits from './AdminAudits.vue'

const isLoading = ref(true)

const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  blockedUsers: 0,
  roleDistribution: [] as { role: string; count: number }[]
})

const logs = ref({
  recentEvents: [] as any[],
  failedLogins: [] as any[],
  adminAudits: [] as any[],
  zeroTrustAlerts: [] as any[]
})

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    const [resStats, resLogs] = await Promise.all([
      fetch('http://localhost:3000/api/dashboard/stats'),
      fetch('http://localhost:3000/api/dashboard/logs')
    ])

    if (resStats.ok) stats.value = await resStats.json()
    if (resLogs.ok) logs.value = await resLogs.json()
  } catch (error) {
    console.error('Error cargando métricas desde el backend:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
}

onMounted(() => {
  fetchDashboardData()
})
</script>