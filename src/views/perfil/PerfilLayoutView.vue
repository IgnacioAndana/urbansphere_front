<script setup lang="ts">
import { ArrowLeft, User, Heart } from 'lucide-vue-next'
import PublicLayout from '../../layouts/PublicLayout.vue'
</script>

<template>
  <PublicLayout>
    <div class="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-6">
      <router-link
        to="/"
        class="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#003399] transition-colors w-fit"
      >
        <ArrowLeft class="w-4 h-4" /> Volver
      </router-link>

      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900">Mi cuenta</h1>
        <p class="text-slate-500 text-sm mt-1">Administra tu perfil y tus propiedades favoritas.</p>
      </div>

      <nav class="flex gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <router-link
          to="/perfil/datos"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
          active-class="bg-white text-[#003399] shadow-sm"
          :class="$route.name === 'perfil-datos' ? '' : 'text-slate-500 hover:text-slate-700'"
        >
          <User class="w-4 h-4" /> Mi perfil
        </router-link>
        <router-link
          to="/perfil/favoritos"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
          active-class="bg-white text-[#003399] shadow-sm"
          :class="$route.name === 'perfil-favoritos' ? '' : 'text-slate-500 hover:text-slate-700'"
        >
          <Heart class="w-4 h-4" /> Favoritos
        </router-link>
      </nav>

      <router-view />
    </div>
  </PublicLayout>
</template>
