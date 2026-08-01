<template>
  <section class="bg-white border border-[#c4c6cf] rounded-lg p-6">
    <h3 class="text-lg font-bold text-[#000613] mb-4">Distribución de Roles</h3>
    <div class="space-y-3">
      <div 
        v-for="item in roleDistribution" 
        :key="item.role"
        class="flex items-center justify-between border-b border-[#c4c6cf] pb-2"
      >
        <span class="text-xs font-semibold uppercase text-[#43474e]">{{ item.role }}</span>
        <span class="text-xs font-bold bg-[#eff4ff] px-3 py-1 rounded-full text-[#000613]">{{ item.count }} usuarios</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  roleDistribution: Array<{ role: string; count: number }>
}>()
</script>