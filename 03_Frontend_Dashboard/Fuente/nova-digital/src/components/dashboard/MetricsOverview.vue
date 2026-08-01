<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white border border-[#c4c6cf] p-6 rounded-lg shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[#43474e] text-xs font-semibold uppercase tracking-wider">Usuarios activos</span>
        <span class="material-symbols-outlined text-[#009969]">group</span>
      </div>
      <div class="flex items-end gap-2">
        <span class="text-3xl font-bold">{{ activeUsers }}</span>
        <span class="text-[#43474e] text-xs pb-1">de {{ totalUsers }} totales</span>
      </div>
    </div>

    <div class="bg-white border border-[#c4c6cf] p-6 rounded-lg shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[#43474e] text-xs font-semibold uppercase tracking-wider">Usuarios Bloqueados</span>
        <span class="material-symbols-outlined text-[#43474e]">person_off</span>
      </div>
      <div class="flex items-end gap-2">
        <span class="text-3xl font-bold">{{ blockedUsers }}</span>
      </div>
    </div>

    <div class="bg-white border border-[#c4c6cf] p-6 rounded-lg shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[#43474e] text-xs font-semibold uppercase tracking-wider">Intentos fallidos</span>
        <span class="material-symbols-outlined text-[#9d4300]">warning</span>
      </div>
      <div class="flex items-end gap-2">
        <span class="text-3xl font-bold">{{ failedAttemptsCount }}</span>
      </div>
    </div>

    <div class="bg-white border border-[#c4c6cf] p-6 rounded-lg shadow-sm border-l-4 border-l-[#ba1a1a]">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[#43474e] text-xs font-semibold uppercase tracking-wider">Alertas activas</span>
        <span class="material-symbols-outlined text-[#ba1a1a]" style="font-variation-settings: 'FILL' 1;">emergency</span>
      </div>
      <div class="flex items-end gap-2">
        <span class="text-3xl font-bold text-[#ba1a1a]">{{ activeAlertsCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeUsers: number
  totalUsers: number
  blockedUsers: number
  failedAttemptsCount: number
  activeAlertsCount: number
}>()
</script>