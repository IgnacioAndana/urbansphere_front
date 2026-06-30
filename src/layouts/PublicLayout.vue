<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import imagotipoUrl from '../assets/UrbanSphere-Imagotipo.png'
import { useSesion } from '../composables/useSesion'

const router = useRouter()
const route = useRoute()
const { autenticado, nombre, accesoAdmin, cargarSesion, cerrarSesion } = useSesion()
const cerrando = ref(false)

onMounted(() => {
  cargarSesion()
})

watch(
  () => route.path,
  () => {
    cargarSesion()
  },
)

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

  </div>
</template>
