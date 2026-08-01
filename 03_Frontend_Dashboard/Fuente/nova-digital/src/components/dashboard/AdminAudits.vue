<template>
  <section class="bg-white border border-[#c4c6cf] rounded-lg p-6">
    <h3 class="text-lg font-bold text-[#000613] mb-6">Cambios Administrativos</h3>
    <div v-if="audits.length === 0" class="text-xs text-[#43474e]">
      No hay registros de auditoría administrativa recientes.
    </div>
    <div class="space-y-4" v-else>
      <div 
        v-for="audit in audits.slice(0, 4)" 
        :key="audit.id" 
        class="border-l-2 border-[#000613] pl-3 py-1"
      >
        <p class="text-xs font-bold text-[#000613]">{{ audit.action }}</p>
        <p class="text-[11px] text-[#43474e]">{{ audit.details }}</p>
        <span class="text-[10px] text-[#43474e]/60">{{ formatDate(audit.date) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  audits: any[]
  formatDate: (date: string) => string
}>()
</script>