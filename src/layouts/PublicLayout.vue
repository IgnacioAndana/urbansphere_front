<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LogOut, Settings, User } from 'lucide-vue-next'
import imagotipoUrl from '../assets/UrbanSphere-Imagotipo.png'
import { useSesion } from '../composables/useSesion'
import { queryLoginDesde } from '../utils/authRedirect'

const router = useRouter()
const route = useRoute()
const { autenticado, nombre, accesoAdmin, cargarSesion, cerrarSesion } = useSesion()
const cerrando = ref(false)
const menuAbierto = ref(false)

const loginQuery = computed(() => queryLoginDesde(route.path, route.fullPath))

onMounted(() => {
  cargarSesion()
})

watch(
  () => route.path,
  () => {
    cargarSesion()
    menuAbierto.value = false
  },
)

const manejarCerrarSesion = async () => {
  cerrando.value = true
  try {
    await cerrarSesion()
    menuAbierto.value = false
    if (router.currentRoute.value.path !== '/') {
      await router.push('/')
    }
  } finally {
    cerrando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 px-3 py-3 flex items-center justify-between shadow-sm h-[75px]">
      <router-link to="/" class="flex items-center">
        <img :src="imagotipoUrl" alt="UrbanSphere Logo" class="h-15 w-60 object-contain" />
      </router-link>
      
      <!-- Nav desktop -->
      <nav class="hidden lg:flex items-center gap-6 font-semibold text-sm text-slate-600">
        <router-link to="/" class="hover:text-[#003399] transition-colors py-1" exact-active-class="text-[#003399] border-b-2 border-[#003399]">Inicio</router-link>
        <router-link to="/catalogo" class="hover:text-[#003399] transition-colors py-1" exact-active-class="text-[#003399] border-b-2 border-[#003399]">Catálogo</router-link>
        <router-link to="/contacto" class="hover:text-[#003399] transition-colors py-1" exact-active-class="text-[#003399] border-b-2 border-[#003399]">Contacto</router-link>
        
        <template v-if="!autenticado">
          <router-link :to="{ name: 'login', query: loginQuery }" class="bg-[#003399] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all shadow-sm">
            Iniciar Sesión
          </router-link>
        </template>
        <template v-else>
          <div class="flex items-center gap-4">
            
            <div class="flex items-center gap-3 pr-4 border-r border-slate-200">
              <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#003399] to-blue-400 flex items-center justify-center text-white shadow-md border-2 border-white">
                <span class="text-xs font-black">{{ (nombre ?? 'Usuario').substring(0, 2).toUpperCase() }}</span>
              </div>
              <div class="flex flex-col hidden sm:flex">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Bienvenido</span>
                <span class="text-sm font-black text-slate-800 leading-none">{{ (nombre ?? 'Usuario').split(' ')[0] }}</span>
              </div>
            </div>

            <router-link
              v-if="!accesoAdmin"
              to="/perfil/datos"
              title="Mi perfil"
              class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[#003399] transition-all"
            >
              <User class="w-4 h-4" /> Mi Perfil
            </router-link>
            
            <router-link v-if="accesoAdmin" to="/admin/nuevo-proyecto" class="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-[#003399] hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <Settings class="w-4 h-4" /> Panel Admin
            </router-link>
            
            <button @click="manejarCerrarSesion" :disabled="cerrando" class="flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold text-sm px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50">
              <LogOut class="w-4 h-4" /> {{ cerrando ? 'Saliendo...' : 'Salir' }}
            </button>
          </div>
        </template>
      </nav>

      <!-- Botón menú móvil / tablet -->
      <button
        type="button"
        class="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
        :aria-expanded="menuAbierto"
        aria-label="Menú"
        @click="menuAbierto = !menuAbierto"
      >
        <svg v-if="!menuAbierto" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <!-- Menú desplegable móvil -->
    <div
      v-if="menuAbierto"
      class="lg:hidden border-t border-slate-100 bg-white px-6 py-6 flex flex-col items-center gap-4 text-center"
    >
      <nav class="flex flex-col items-center gap-1 w-full max-w-xs">
        <router-link to="/" class="w-full py-2.5 text-sm font-semibold text-slate-700 hover:text-[#003399] rounded-lg hover:bg-slate-50 transition-colors" @click="menuAbierto = false">Inicio</router-link>
        <router-link to="/catalogo" class="w-full py-2.5 text-sm font-semibold text-slate-700 hover:text-[#003399] rounded-lg hover:bg-slate-50 transition-colors" @click="menuAbierto = false">Catálogo</router-link>
        <router-link to="/contacto" class="w-full py-2.5 text-sm font-semibold text-slate-700 hover:text-[#003399] rounded-lg hover:bg-slate-50 transition-colors" @click="menuAbierto = false">Contacto</router-link>
      </nav>

      <template v-if="autenticado">
        <div class="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-xl w-full max-w-xs mt-2">
          <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#003399] to-blue-400 flex items-center justify-center text-white shadow-sm border-2 border-white">
             <span class="text-sm font-black">{{ (nombre ?? 'Usuario').substring(0, 2).toUpperCase() }}</span>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Sesión iniciada</p>
            <p class="text-sm font-black text-slate-800 leading-none">{{ nombre ?? 'Usuario' }}</p>
          </div>
        </div>

        <div class="flex flex-col items-center gap-2 w-full max-w-xs">
          <router-link
            v-if="!accesoAdmin"
            to="/perfil/datos"
            class="flex items-center justify-center gap-2 w-full text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-[#003399] p-3 rounded-xl transition-colors"
            @click="menuAbierto = false"
          >
            <User class="w-5 h-5" /> Mi perfil
          </router-link>

          <router-link
            v-if="accesoAdmin"
            to="/admin/nuevo-proyecto"
            class="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-xl text-sm font-bold shadow-md hover:from-[#003399] hover:to-blue-700 transition-all"
            @click="menuAbierto = false"
          >
            <Settings class="w-5 h-5" /> Panel Admin
          </router-link>

          <button
            type="button"
            :disabled="cerrando"
            class="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-600 p-3 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors disabled:opacity-50"
            @click="manejarCerrarSesion"
          >
            <LogOut class="w-5 h-5" /> {{ cerrando ? 'Saliendo...' : 'Cerrar sesión' }}
          </button>
        </div>
      </template>

      <router-link
        v-else
        :to="{ name: 'login', query: loginQuery }"
        class="w-full max-w-xs bg-[#003399] text-white px-4 py-2.5 rounded-lg text-sm font-bold text-center"
        @click="menuAbierto = false"
      >
        Iniciar sesión
      </router-link>
    </div>

    <main class="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
