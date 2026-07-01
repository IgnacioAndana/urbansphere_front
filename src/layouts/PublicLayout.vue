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
const menuAbierto = ref(false)

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

const onPerfilActualizado = () => {
  cargarSesion()
}

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
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div class="h-14 sm:h-[75px] px-3 sm:px-4 flex items-center justify-between gap-2">
        <router-link to="/" class="flex items-center min-w-0 shrink">
          <img
            :src="imagotipoUrl"
            alt="UrbanSphere Logo"
            class="h-8 sm:h-10 md:h-12 w-auto max-w-[130px] sm:max-w-[180px] md:max-w-[240px] object-contain object-left"
          />
        </router-link>

        <!-- Nav desktop -->
        <nav class="hidden lg:flex items-center gap-4 font-semibold text-sm text-slate-600 shrink-0">
          <router-link to="/" class="hover:text-[#003399] transition-colors">Catálogo</router-link>
          <span class="cursor-pointer hover:text-[#003399] transition-colors">Contacto</span>

          <template v-if="autenticado">
            <div class="flex items-center gap-2 pl-4 border-l border-slate-200 text-xs text-slate-500">
              <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Sesión activa:
                <strong class="text-slate-800">{{ nombre ?? 'Usuario' }}</strong>
              </span>
            </div>

            <button
              v-if="!accesoAdmin"
              type="button"
              title="Mi perfil"
              aria-label="Mi perfil"
              class="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-[#003399] hover:border-[#003399] transition-all"
              @click="perfilAbierto = true"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            <router-link
              v-if="accesoAdmin"
              to="/admin/nuevo-proyecto"
              class="bg-[#003399] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all shadow-sm whitespace-nowrap"
            >
              Panel Admin
            </router-link>

            <button
              type="button"
              :disabled="cerrando"
              class="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50 whitespace-nowrap"
              @click="manejarCerrarSesion"
            >
              {{ cerrando ? 'Saliendo...' : 'Cerrar sesión' }}
            </button>
          </template>

          <router-link
            v-else
            to="/login"
            class="bg-[#003399] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all shadow-sm whitespace-nowrap"
          >
            Iniciar sesión
          </router-link>
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
      </div>

      <!-- Menú desplegable móvil -->
      <div
        v-if="menuAbierto"
        class="lg:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-3"
      >
        <router-link to="/" class="text-sm font-semibold text-slate-700 hover:text-[#003399]" @click="menuAbierto = false">
          Catálogo
        </router-link>
        <span class="text-sm font-semibold text-slate-700">Contacto</span>

        <template v-if="autenticado">
          <div class="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              Sesión:
              <strong class="text-slate-800">{{ nombre ?? 'Usuario' }}</strong>
            </span>
          </div>

          <button
            v-if="!accesoAdmin"
            type="button"
            class="w-full text-left text-sm font-semibold text-slate-700 hover:text-[#003399] py-1"
            @click="perfilAbierto = true; menuAbierto = false"
          >
            Mi perfil
          </button>

          <router-link
            v-if="accesoAdmin"
            to="/admin/nuevo-proyecto"
            class="bg-[#003399] text-white px-4 py-2.5 rounded-lg text-sm font-bold text-center"
            @click="menuAbierto = false"
          >
            Panel Admin
          </router-link>

          <button
            type="button"
            :disabled="cerrando"
            class="w-full border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            @click="manejarCerrarSesion"
          >
            {{ cerrando ? 'Saliendo...' : 'Cerrar sesión' }}
          </button>
        </template>

        <router-link
          v-else
          to="/login"
          class="bg-[#003399] text-white px-4 py-2.5 rounded-lg text-sm font-bold text-center"
          @click="menuAbierto = false"
        >
          Iniciar sesión
        </router-link>
      </div>
    </header>

    <main class="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <slot />
    </main>

    <MiPerfilModal :abierto="perfilAbierto" @cerrar="perfilAbierto = false" @actualizado="onPerfilActualizado" />
  </div>
</template>
