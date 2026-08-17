<template>
  <div class="flex h-full min-h-[calc(100vh-64px)] items-center justify-center p-8">
    <div class="w-full max-w-2xl rounded-2xl border border-[#c4c6cf] bg-white p-10 shadow-sm text-center">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#eff4ff] text-[#2f486a]">
        <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1;">school</span>
      </div>

      <h1 class="text-4xl font-bold text-[#000613] leading-tight">
        Bienvenido/a, {{ userName || 'Usuario' }}
      </h1>

      <p class="mt-4 text-sm font-medium text-[#ba1a1a]">
        {{ roleName }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  roleName: string
  userName?: string
}>()
</script>
