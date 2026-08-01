<template>
  <div class="bg-[#f8f9ff] text-[#0b1c30] min-h-screen font-sans flex overflow-hidden">
    <!-- Iconos de Material Symbols -->
    <link 
      rel="stylesheet" 
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
    />

    <!-- Sidebar / Menú Lateral -->
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
        <button 
          @click="currentTab = 'dashboard'"
          :class="currentTab === 'dashboard' ? 'bg-[#2f486a] text-white font-semibold' : 'text-[#afc8f0] hover:bg-[#2f486a]/50 hover:text-white'"
          class="w-full text-left flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-transform active:scale-95"
        >
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
          <span class="text-sm">Dashboard</span>
        </button>

        <button 
          @click="currentTab = 'usuarios'"
          :class="currentTab === 'usuarios' ? 'bg-[#2f486a] text-white font-semibold' : 'text-[#afc8f0] hover:bg-[#2f486a]/50 hover:text-white'"
          class="w-full text-left flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-transform active:scale-95"
        >
          <span class="material-symbols-outlined">fingerprint</span>
          <span class="text-sm">Usuarios</span>
        </button>

        <button 
          @click="currentTab = 'actividad'"
          :class="currentTab === 'actividad' ? 'bg-[#2f486a] text-white font-semibold' : 'text-[#afc8f0] hover:bg-[#2f486a]/50 hover:text-white'"
          class="w-full text-left flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-transform active:scale-95"
        >
          <span class="material-symbols-outlined">history</span>
          <span class="text-sm">Actividad</span>
        </button>
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

    <!-- Top Header / Barra Superior -->
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
          <span v-if="hasNotifications" class="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
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

    <!-- Área de Trabajo Principal -->
    <main class="ml-[240px] mt-16 p-8 h-[calc(100vh-64px)] overflow-y-auto w-[calc(100%-240px)]">
      <slot :currentTab="currentTab" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

defineProps<{
  hasNotifications?: boolean
}>()

const { user, logout } = useAuth0()
const currentTab = ref('dashboard')

const handleLogout = () => {
  logout({ logoutParams: { returnTo: window.location.origin } })
}
</script>