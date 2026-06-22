<script setup lang="ts">
// Importamos el imagotipo horizontal directamente desde assets
import imagotipoUrl from '../assets/UrbanSphere-Imagotipo.png';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 px-3 py-3 flex items-center justify-between shadow-sm h-[75px]">
      <router-link to="/" class="flex items-center">
        <img :src="imagotipoUrl" alt="UrbanSphere Logo" class="h-15 w-60 object-contain" />
      </router-link>
      
      <nav class="flex items-center gap-6 font-semibold text-sm text-slate-600">
        <router-link to="/" class="hover:text-[#003399] transition-colors">Catálogo</router-link>
        <span class="cursor-pointer hover:text-[#003399] transition-colors">Contacto</span>
        <router-link to="/login" class="bg-[#003399] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all shadow-sm">
          Panel Admin
        </router-link>
      </nav>
    </header>

    <main class="flex-1 flex flex-col">
      <slot />
    </main>

  </div>
</template>