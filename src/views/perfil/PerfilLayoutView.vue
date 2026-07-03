<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, User, Heart, LayoutGrid } from 'lucide-vue-next'
import PublicLayout from '../../layouts/PublicLayout.vue'
import { useSesion } from '../../composables/useSesion'

const route = useRoute()
const { nombre, cargarSesion } = useSesion()

onMounted(() => {
  void cargarSesion()
})

const navItems = [
  { name: 'perfil-datos', to: '/perfil/datos', label: 'Mi perfil', icon: User },
  { name: 'perfil-favoritos', to: '/perfil/favoritos', label: 'Favoritos', icon: Heart },
] as const

const tituloSeccion = computed(() => {
  if (route.name === 'perfil-favoritos') return 'Mis favoritos'
  return 'Datos de la cuenta'
})

const iniciales = computed(() => {
  const n = nombre.value?.trim() ?? 'U'
  return n
    .split(' ')
    .map((p) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})
</script>

<template>
  <PublicLayout>
    <div class="bg-slate-50 min-h-[calc(100dvh-75px)]">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <router-link
          to="/"
          class="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#003399] transition-colors w-fit mb-6"
        >
          <ArrowLeft class="w-4 h-4" /> Volver al inicio
        </router-link>

        <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <!-- Barra lateral -->
          <aside class="lg:w-56 xl:w-64 shrink-0 flex flex-col gap-4">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div class="flex items-center gap-3 mb-4 lg:mb-6">
                <div
                  class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#003399] to-blue-400 flex items-center justify-center text-white text-sm font-black shrink-0"
                >
                  {{ iniciales }}
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Panel Cuenta</p>
                  <p class="text-sm font-black text-slate-900 truncate">{{ nombre ?? 'Usuario' }}</p>
                </div>
              </div>

              <nav class="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                <router-link
                  v-for="item in navItems"
                  :key="item.name"
                  :to="item.to"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors shrink-0"
                  :class="
                    route.name === item.name
                      ? 'bg-blue-50 text-[#003399]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#003399]'
                  "
                >
                  <component :is="item.icon" class="w-4 h-4 shrink-0" />
                  {{ item.label }}
                </router-link>
              </nav>
            </div>

            <router-link
              to="/catalogo"
              class="hidden lg:flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:border-[#003399] hover:text-[#003399] transition-colors shadow-sm"
            >
              <LayoutGrid class="w-4 h-4" /> Explorar catálogo
            </router-link>
          </aside>

          <!-- Contenido principal -->
          <main class="flex-1 min-w-0">
            <div class="mb-4">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900">{{ tituloSeccion }}</h1>
              <p class="text-slate-500 text-sm mt-0.5">
                <template v-if="route.name === 'perfil-favoritos'">
                  Propiedades que guardaste con el corazón en el catálogo.
                </template>
                <template v-else>
                  Administra tu nombre, correo y contraseña de acceso.
                </template>
              </p>
            </div>

            <router-view />
          </main>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
