<template>
  <div class="bg-[#f8f9ff] text-[#0b1c30] min-h-screen font-sans flex overflow-hidden">
    <!-- Carga de Material Symbols -->
    <link 
      rel="stylesheet" 
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
    />

    <!-- SideNavBar -->
    <aside class="fixed left-0 top-0 h-full w-[240px] z-50 bg-[#000613] flex flex-col py-6 px-4 shadow-sm">
      <div class="mb-8 px-2 flex items-center gap-2">
        <div class="w-8 h-8 bg-[#2f486a] rounded flex items-center justify-center">
          <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">security</span>
        </div>
        <div>
          <h1 class="font-bold text-lg text-white leading-none">Nova Digital</h1>
          <p class="text-[10px] text-[#afc8f0] tracking-widest uppercase mt-1">IAM CONTROL CENTER</p>
        </div>
      </div>

      <nav class="flex-1 space-y-1">
        <div class="bg-[#2f486a] text-white font-semibold flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-transform active:scale-95">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
          <span class="text-sm">Dashboard</span>
        </div>
        <div class="text-[#afc8f0] hover:bg-[#2f486a]/50 hover:text-white transition-colors flex items-center gap-3 px-3 py-2 rounded cursor-pointer active:scale-95">
          <span class="material-symbols-outlined">fingerprint</span>
          <span class="text-sm">Usuarios</span>
        </div>
        <div class="text-[#afc8f0] hover:bg-[#2f486a]/50 hover:text-white transition-colors flex items-center gap-3 px-3 py-2 rounded cursor-pointer active:scale-95">
          <span class="material-symbols-outlined">history</span>
          <span class="text-sm">Actividad</span>
        </div>
      </nav>

      <div class="pt-6 border-t border-white/10 space-y-1">
        <button 
          @click="handleLogout"
          class="w-full text-[#afc8f0] hover:bg-[#2f486a]/50 hover:text-white transition-colors flex items-center gap-3 px-3 py-2 rounded cursor-pointer"
        >
          <span class="material-symbols-outlined">logout</span>
          <span class="text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- TopAppBar -->
    <header class="fixed top-0 right-0 left-[240px] h-16 z-40 bg-[#f8f9ff] border-b border-[#c4c6cf] flex items-center justify-between px-8 w-[calc(100%-240px)]">
      <div class="flex items-center gap-6 w-1/2">
        <div class="relative w-full max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#43474e]">search</span>
          <input 
            type="text" 
            placeholder="Buscar recursos, usuarios o logs..." 
            class="w-full bg-[#eff4ff] border-none rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-[#000613] outline-none"
          />
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button class="relative p-2 text-[#43474e] hover:bg-[#eff4ff] transition-colors rounded-full">
          <span class="material-symbols-outlined">notifications</span>
          <span v-if="logs.failedLogins.length > 0" class="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
        </button>
        <div class="h-8 w-px bg-[#c4c6cf]"></div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-xs font-bold text-[#0b1c30] leading-none">{{ user?.name || user?.email }}</p>
            <p class="text-[10px] text-[#43474e] font-medium mt-1 truncate max-w-[150px]">{{ user?.email }}</p>
          </div>
          <img 
            :src="user?.picture || 'https://i.imgur.com/6Hu6uxt.png'" 
            alt="Avatar"
            class="w-10 h-10 rounded-lg object-cover border border-[#c4c6cf]"
          />
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="ml-[240px] mt-16 p-8 h-[calc(100vh-64px)] overflow-y-auto w-[calc(100%-240px)]">
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

      <!-- Indicator de Carga -->
      <div v-if="isLoading" class="py-12 text-center text-xs font-bold text-[#43474e]">
        Obteniendo datos de Auth0...
      </div>

      <template v-else>
        <!-- Top Metrics Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Active Users -->
          <div class="bg-white border border-[#c4c6cf] p-6 rounded-lg shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[#43474e] text-xs font-semibold uppercase tracking-wider">Usuarios activos</span>
              <span class="material-symbols-outlined text-[#009969]">group</span>
            </div>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-bold">{{ stats.activeUsers }}</span>
              <span class="text-[#43474e] text-xs pb-1">de {{ stats.totalUsers }} totales</span>
            </div>
          </div>

          <!-- Inactive / Blocked Users -->
          <div class="bg-white border border-[#c4c6cf] p-6 rounded-lg shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[#43474e] text-xs font-semibold uppercase tracking-wider">Usuarios Bloqueados</span>
              <span class="material-symbols-outlined text-[#43474e]">person_off</span>
            </div>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-bold">{{ stats.blockedUsers }}</span>
            </div>
          </div>

          <!-- Failed Auth Attempts -->
          <div class="bg-white border border-[#c4c6cf] p-6 rounded-lg shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[#43474e] text-xs font-semibold uppercase tracking-wider">Intentos fallidos</span>
              <span class="material-symbols-outlined text-[#9d4300]">warning</span>
            </div>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-bold">{{ logs.failedLogins.length }}</span>
            </div>
          </div>

          <!-- Security Alerts -->
          <div class="bg-white border border-[#c4c6cf] p-6 rounded-lg shadow-sm border-l-4 border-l-[#ba1a1a]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[#43474e] text-xs font-semibold uppercase tracking-wider">Alertas activas</span>
              <span class="material-symbols-outlined text-[#ba1a1a]" style="font-variation-settings: 'FILL' 1;">emergency</span>
            </div>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-bold text-[#ba1a1a]">{{ logs.zeroTrustAlerts.length }}</span>
            </div>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-12 gap-8">
          <!-- Left Column -->
          <div class="col-span-12 lg:col-span-8 space-y-8">
            <!-- Role Distribution -->
            <section class="bg-white border border-[#c4c6cf] rounded-lg p-6">
              <h3 class="text-lg font-bold text-[#000613] mb-4">Distribución de Roles</h3>
              <div class="space-y-3">
                <div 
                  v-for="item in stats.roleDistribution" 
                  :key="item.role"
                  class="flex items-center justify-between border-b border-[#c4c6cf] pb-2"
                >
                  <span class="text-xs font-semibold uppercase text-[#43474e]">{{ item.role }}</span>
                  <span class="text-xs font-bold bg-[#eff4ff] px-3 py-1 rounded-full text-[#000613]">{{ item.count }} usuarios</span>
                </div>
              </div>
            </section>

            <!-- Recent Access Events -->
            <section class="bg-white border border-[#c4c6cf] rounded-lg overflow-hidden">
              <div class="p-6 flex items-center justify-between bg-[#eff4ff] border-b border-[#c4c6cf]">
                <h3 class="text-lg font-bold text-[#000613]">Eventos Recientes</h3>
                <span class="text-[10px] bg-[#000613] text-white px-2 py-1 rounded font-bold uppercase tracking-tight">Logs en vivo</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-[#e5eeff] text-[#43474e] border-b border-[#c4c6cf]">
                      <th class="px-6 py-3 text-xs font-semibold uppercase">Usuario</th>
                      <th class="px-6 py-3 text-xs font-semibold uppercase">Fecha / Hora</th>
                      <th class="px-6 py-3 text-xs font-semibold uppercase">Acción</th>
                      <th class="px-6 py-3 text-xs font-semibold uppercase">Resultado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#c4c6cf]/50 text-xs">
                    <tr v-for="evt in logs.recentEvents.slice(0, 7)" :key="evt.id" class="hover:bg-[#eff4ff] transition-colors">
                      <td class="px-6 py-3 font-medium">{{ evt.user }}</td>
                      <td class="px-6 py-3 text-[#43474e] font-mono">{{ formatDate(evt.date) }}</td>
                      <td class="px-6 py-3 uppercase">{{ evt.action }}</td>
                      <td class="px-6 py-3">
                        <span 
                          :class="evt.status === 'PERMITIDO' ? 'bg-[#009969]/10 text-[#009969]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'"
                          class="px-2 py-1 rounded-full text-[10px] font-bold"
                        >
                          {{ evt.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- Right Column -->
          <div class="col-span-12 lg:col-span-4 space-y-8">
            <!-- Zero Trust Alerts -->
            <section class="bg-white border border-[#c4c6cf] rounded-lg p-6">
              <div class="flex items-center gap-2 mb-6">
                <span class="material-symbols-outlined text-[#ba1a1a]">security</span>
                <h3 class="text-lg font-bold text-[#000613]">Alertas Zero Trust</h3>
              </div>
              <div v-if="logs.zeroTrustAlerts.length === 0" class="text-xs text-[#43474e]">
                No hay amenazas o bloqueos detectados recientemente.
              </div>
              <div class="space-y-4" v-else>
                <div 
                  v-for="alert in logs.zeroTrustAlerts.slice(0, 4)" 
                  :key="alert.id"
                  class="flex gap-3 p-3 bg-[#ba1a1a]/5 border-l-4 border-[#ba1a1a] rounded-r"
                >
                  <div>
                    <p class="text-xs font-bold text-[#ba1a1a]">{{ alert.title }}</p>
                    <p class="text-[11px] text-[#43474e]">{{ alert.user }}</p>
                    <p class="text-[10px] text-[#43474e]/70 mt-1">{{ formatDate(alert.date) }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Recent Administrative Audits -->
            <section class="bg-white border border-[#c4c6cf] rounded-lg p-6">
              <h3 class="text-lg font-bold text-[#000613] mb-6">Cambios Administrativos</h3>
              <div v-if="logs.adminAudits.length === 0" class="text-xs text-[#43474e]">
                No hay registros de auditoría administrativa recientes.
              </div>
              <div class="space-y-4" v-else>
                <div 
                  v-for="audit in logs.adminAudits.slice(0, 4)" 
                  :key="audit.id" 
                  class="border-l-2 border-[#000613] pl-3 py-1"
                >
                  <p class="text-xs font-bold text-[#000613]">{{ audit.action }}</p>
                  <p class="text-[11px] text-[#43474e]">{{ audit.details }}</p>
                  <span class="text-[10px] text-[#43474e]/60">{{ formatDate(audit.date) }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

const { user, logout } = useAuth0()

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

    if (resStats.ok) {
      stats.value = await resStats.json()
    }
    if (resLogs.ok) {
      logs.value = await resLogs.json()
    }
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

const handleLogout = () => {
  logout({
    logoutParams: { returnTo: window.location.origin }
  })
}
</script>