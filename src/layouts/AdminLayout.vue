<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png'
import { useSesion } from '../composables/useSesion'
import { nombreRolPorId } from '../constants/roles'

defineProps<{
  titulo?: string
}>()

const router = useRouter()
const route = useRoute()
const { nombre, rolId, email, puedeVerUsuarios, cargarSesion, cerrarSesion } = useSesion()

const nombreUsuario = ref('Administrador')
const rolUsuario = ref('Admin')
const cerrando = ref(false)
const menuAbierto = ref(false)

const iniciales = computed(() => {
  const partes = nombreUsuario.value.trim().split(/\s+/)
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return nombreUsuario.value.slice(0, 2).toUpperCase()
})

const esRutaProyectos = computed(() => route.path.includes('nuevo-proyecto'))
const esRutaUsuarios = computed(() => route.path.includes('/admin/usuarios'))
const esRutaPerfil = computed(() => route.path.includes('/admin/perfil'))

const claseNav = (activo: boolean) =>
  activo
    ? 'bg-[#003399]/10 text-[#003399] font-semibold ring-1 ring-[#003399]/20'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'

onMounted(async () => {
  await cargarSesion()
  sincronizarNombre()
})

watch(
  () => route.path,
  () => {
    menuAbierto.value = false
  },
)

const sincronizarNombre = () => {
  if (nombre.value) nombreUsuario.value = nombre.value
  if (rolId.value != null) rolUsuario.value = nombreRolPorId(rolId.value)
}

watch([nombre, rolId], sincronizarNombre)

const manejarCerrarSesion = async () => {
  cerrando.value = true
  try {
    await cerrarSesion()
    await router.push('/')
  } finally {
    cerrando.value = false
  }
}
</script>

<template>
  <div class="flex h-screen bg-slate-100 overflow-hidden">
    <!-- Overlay móvil -->
    <div
      v-if="menuAbierto"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      aria-hidden="true"
      @click="menuAbierto = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:max-w-none"
      :class="menuAbierto ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-14 sm:h-16 px-4 flex items-center border-b border-slate-100 shrink-0">
        <router-link to="/" class="flex items-center gap-2.5 min-w-0 w-full" @click="menuAbierto = false">
          <img
            :src="isotipoUrl"
            alt=""
            class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 object-contain"
            aria-hidden="true"
          />
          <span class="text-sm sm:text-[15px] font-black tracking-tight leading-none truncate">
            <span class="text-[#003399]">Urban</span><span class="text-slate-700">Sphere</span>
          </span>
        </router-link>
      </div>

      <div class="p-3 sm:p-4 border-b border-slate-100">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#003399] text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
            {{ iniciales }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-800 truncate">{{ nombreUsuario }}</p>
            <p class="text-xs text-slate-500 capitalize truncate">{{ rolUsuario }}</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 flex flex-col gap-6 overflow-y-auto">
        <div>
          <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Gestión</p>
          <div class="flex flex-col gap-0.5">
            <router-link
              to="/admin/nuevo-proyecto"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              :class="claseNav(esRutaProyectos)"
              @click="menuAbierto = false"
            >
              <svg class="w-5 h-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Proyectos
            </router-link>
            <router-link
              v-if="puedeVerUsuarios"
              to="/admin/usuarios"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              :class="claseNav(esRutaUsuarios)"
              @click="menuAbierto = false"
            >
              <svg class="w-5 h-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuarios
            </router-link>
          </div>
        </div>

        <div>
          <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Mi cuenta</p>
          <div class="flex flex-col gap-0.5">
            <router-link
              to="/admin/perfil"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              :class="claseNav(esRutaPerfil)"
              @click="menuAbierto = false"
            >
              <svg class="w-5 h-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi perfil
            </router-link>
            <router-link
              to="/"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              @click="menuAbierto = false"
            >
              <svg class="w-5 h-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ir al catálogo
            </router-link>
          </div>
        </div>
      </nav>

      <div class="p-3 border-t border-slate-100">
        <button
          type="button"
          :disabled="cerrando"
          class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
          @click="manejarCerrarSesion"
        >
          <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {{ cerrando ? 'Saliendo...' : 'Cerrar sesión' }}
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden min-w-0 w-full">
      <header class="bg-white border-b border-slate-200 h-14 sm:h-16 flex items-center justify-between gap-3 px-4 sm:px-6 shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <button
            type="button"
            class="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
            aria-label="Abrir menú"
            @click="menuAbierto = true"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="text-xs sm:text-sm text-slate-500 truncate min-w-0">
            Panel <span class="text-slate-300 mx-1">/</span>
            <span class="text-[#003399] font-semibold">{{ titulo ?? 'Inicio' }}</span>
          </div>
        </div>
        <router-link
          to="/admin/perfil"
          class="text-xs text-slate-500 hover:text-[#003399] font-medium transition-colors truncate max-w-[120px] sm:max-w-[200px] shrink-0"
          :title="email ?? undefined"
        >
          {{ email }}
        </router-link>
      </header>

      <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
