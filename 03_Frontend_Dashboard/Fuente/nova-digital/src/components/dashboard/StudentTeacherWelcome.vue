<template>
  <div class="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6">
    <div class="w-full max-w-xl rounded-2xl border border-[#c4c6cf] bg-white p-8 shadow-sm text-center">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#eff4ff] text-[#2f486a]">
        <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1;">school</span>
      </div>

      <span class="inline-flex items-center rounded-full bg-[#e5eeff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2f486a]">
        {{ roleLabel }}
      </span>

      <h1 class="mt-5 text-3xl font-bold text-[#000613]">
        Bienvenido{{ userName ? `, ${userName}` : '' }}
      </h1>

      <p class="mt-3 text-sm leading-6 text-[#43474e]">
        Tu acceso está configurado correctamente para este portal académico.
      </p>

      <div class="mt-6 border-t border-[#c4c6cf] pt-5">
        <p class="text-sm font-medium text-[#000613]">
          Perfil activo: <span class="text-[#2f486a]">{{ roleLabel }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  roleLabel: string
  userName?: string
}>()
</script>
