<template>
  <section class="bg-white border border-[#c4c6cf] rounded-lg p-6">
    <div class="flex items-center gap-2 mb-6">
      <span class="material-symbols-outlined text-[#ba1a1a]">security</span>
      <h3 class="text-lg font-bold text-[#000613]">Alertas Zero Trust</h3>
    </div>
    <div v-if="alerts.length === 0" class="text-xs text-[#43474e]">
      No hay amenazas o bloqueos detectados recientemente.
    </div>
    <div class="space-y-4" v-else>
      <div 
        v-for="alert in alerts.slice(0, 4)" 
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
</template>

<script setup lang="ts">
defineProps<{
  alerts: any[]
  formatDate: (date: string) => string
}>()
</script>