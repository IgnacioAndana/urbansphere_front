<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import imagotipoUrl from '../assets/UrbanSphere-Imagotipo.png'
import MiPerfilModal from '../components/MiPerfilModal.vue'
import { useSesion } from '../composables/useSesion'

const router = useRouter()
const route = useRoute()
const { autenticado, nombre, accesoAdmin, cargarSesion, cerrarSesion } = useSesion()
const cerrando = ref(false)
const perfilAbierto = ref(false)

onMounted(() => {
  cargarSesion()
})

watch(
  () => route.path,
  () => {
    cargarSesion()
  },
)

const onPerfilActualizado = () => {
  cargarSesion()
}

const manejarCerrarSesion = async () => {
  cerrando.value = true
  try {
    await cerrarSesion()
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
      
      <nav class="flex items-center gap-4 font-semibold text-sm text-slate-600">
        <router-link to="/" class="hover:text-[#003399] transition-colors">Catálogo</router-link>
        <span class="cursor-pointer hover:text-[#003399] transition-colors hidden sm:inline">Contacto</span>

        <template v-if="autenticado">
          <div class="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs text-slate-500">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              Sesión activa:
              <strong class="text-slate-800">{{ nombre ?? 'Usuario' }}</strong>
            </span>
          </div>

          <div class="flex md:hidden items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-500">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <strong class="text-slate-800 truncate max-w-[100px]">{{ nombre ?? 'Usuario' }}</strong>
          </div>

          <button
            v-if="!accesoAdmin"
            type="button"
            title="Configurar mi cuenta"
            aria-label="Configurar mi cuenta"
            class="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-[#003399] hover:border-[#003399] transition-all"
            @click="perfilAbierto = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>

          <router-link
            v-if="accesoAdmin"
            to="/admin/nuevo-proyecto"
            class="bg-[#003399] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all shadow-sm"
          >
            Panel Admin
          </router-link>

          <button
            type="button"
            :disabled="cerrando"
            class="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
            @click="manejarCerrarSesion"
          >
            {{ cerrando ? 'Saliendo...' : 'Cerrar sesión' }}
          </button>
        </template>

        <router-link
          v-else
          to="/login"
          class="bg-[#003399] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all shadow-sm"
        >
          Iniciar sesión
        </router-link>
      </nav>
    </header>

    <main class="flex-1 flex flex-col">
      <slot />
    </main>

    <MiPerfilModal :abierto="perfilAbierto" @cerrar="perfilAbierto = false" @actualizado="onPerfilActualizado" />
  </div>
</template>
