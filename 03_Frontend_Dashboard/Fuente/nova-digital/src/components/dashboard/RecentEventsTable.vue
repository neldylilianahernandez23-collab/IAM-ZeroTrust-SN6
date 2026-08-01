<template>
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
          <tr v-for="evt in events.slice(0, 7)" :key="evt.id" class="hover:bg-[#eff4ff] transition-colors">
            <td class="px-6 py-3 font-medium">{{ evt.user || 'Usuario Anónimo' }}</td>
            <td class="px-6 py-3 text-[#43474e] font-mono">{{ formatDate(evt.date) }}</td>
            <td class="px-6 py-3 uppercase font-semibold">{{ evt.action || evt.type }}</td>
            <td class="px-6 py-3">
              <span 
                :class="isSuccess(evt) ? 'bg-[#009969]/10 text-[#009969]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'"
                class="px-2 py-1 rounded-full text-[10px] font-bold"
              >
                {{ isSuccess(evt) ? 'PERMITIDO' : 'DENEGADO' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  events: any[]
  formatDate: (date: string) => string
}>()

// Función helper para evaluar si el evento fue exitoso
const isSuccess = (evt: any): boolean => {
  // Si tu backend ya calculó un status explicito
  if (evt.status === 'PERMITIDO' || evt.status === 'SUCCESS') return true;
  
  // Si evaluamos directamente el código de acción/tipo de Auth0 (ej: 'seccft', 'sapi', 's')
  const actionCode = (evt.action || evt.type || '').toString().toLowerCase();
  return actionCode.startsWith('s');
}
</script>