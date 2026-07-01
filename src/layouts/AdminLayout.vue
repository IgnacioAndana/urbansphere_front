<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import imagotipoUrl from '../assets/UrbanSphere-Imagotipo.png'
import MiPerfilModal from '../components/MiPerfilModal.vue'
import { useSesion } from '../composables/useSesion'

defineProps<{
  titulo?: string
}>()

const router = useRouter()
const route = useRoute()
const { nombre, rolNombre, puedeVerUsuarios, cargarSesion, cerrarSesion } = useSesion()

const nombreUsuario = ref('Administrador')
const rolUsuario = ref('Admin')
const cerrando = ref(false)
const perfilAbierto = ref(false)

const iniciales = computed(() => {
  const partes = nombreUsuario.value.trim().split(/\s+/)
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return nombreUsuario.value.slice(0, 2).toUpperCase()
})

const esRutaProyectos = computed(() => route.path.includes('nuevo-proyecto'))
const esRutaUsuarios = computed(() => route.path.includes('/admin/usuarios'))

onMounted(async () => {
  await cargarSesion()
  if (nombre.value) nombreUsuario.value = nombre.value
  if (rolNombre.value) rolUsuario.value = rolNombre.value
})

const onPerfilActualizado = async () => {
  await cargarSesion()
  if (nombre.value) nombreUsuario.value = nombre.value
}

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
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <aside class="w-64 bg-[#0f172a] text-slate-300 flex flex-col shadow-xl z-20">
      <div class="p-6 border-b border-slate-800 flex items-center justify-center h-[73px] shrink-0 bg-[#E7E7E7]">
        <img :src="imagotipoUrl" alt="UrbanSphere Admin" class="h-9 object-contain" />
      </div>

      <div class="p-4 uppercase text-[10px] font-bold text-slate-500 tracking-wider">Menú Principal</div>
      <nav class="flex-1 px-4 flex flex-col gap-1">
        <router-link
          to="/admin/nuevo-proyecto"
          class="flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-colors"
          :class="esRutaProyectos ? 'bg-[#003399] text-white font-bold' : 'hover:bg-slate-800'"
        >
          <span>📝</span> Proyectos
        </router-link>
        <router-link
          v-if="puedeVerUsuarios"
          to="/admin/usuarios"
          class="flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-colors"
          :class="esRutaUsuarios ? 'bg-[#003399] text-white font-bold' : 'hover:bg-slate-800'"
        >
          <span>👥</span> Usuarios
        </router-link>
        <router-link to="/" class="flex items-center gap-3 px-3 py-3 hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors">
          <span>🏠</span> Volver al catálogo
        </router-link>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <button
          type="button"
          :disabled="cerrando"
          class="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg font-medium text-sm text-red-400 disabled:opacity-50"
          @click="manejarCerrarSesion"
        >
          <span>🚪</span> {{ cerrando ? 'Cerrando...' : 'Cerrar sesión' }}
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
        <div class="text-sm text-slate-500 font-medium">
          Admin &gt; <span class="text-[#003399] font-bold">{{ titulo ?? 'Panel' }}</span>
        </div>
        <button
          type="button"
          class="flex items-center gap-3 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors"
          @click="perfilAbierto = true"
        >
          <div class="w-8 h-8 bg-blue-100 text-[#003399] rounded-full flex items-center justify-center font-bold text-xs">{{ iniciales }}</div>
          <div class="text-xs text-left">
            <p class="font-bold text-slate-800">{{ nombreUsuario }}</p>
            <p class="text-slate-500 capitalize">{{ rolUsuario }}</p>
          </div>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-8">
        <slot />
      </div>
    </main>

    <MiPerfilModal :abierto="perfilAbierto" @cerrar="perfilAbierto = false" @actualizado="onPerfilActualizado" />
  </div>
</template>
