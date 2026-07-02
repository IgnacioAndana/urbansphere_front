<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FileText, Users, LogOut, Home, Compass } from 'lucide-vue-next'
import imagotipoUrl from '../assets/UrbanSphere-Imagotipo.png'
import { useSesion } from '../composables/useSesion'
import { nombreRolPorId } from '../constants/roles'

defineProps<{
  titulo?: string
}>()

const router = useRouter()
const route = useRoute()
const { nombre, rolId, puedeVerUsuarios, cargarSesion, cerrarSesion } = useSesion()

const nombreUsuario = ref('Administrador')
const rolUsuario = ref('Admin')
const cerrando = ref(false)
const menuAbierto = ref(false)

const iniciales = computed(() => {
  const partes = nombreUsuario.value.trim().split(/\s+/)
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return nombreUsuario.value.slice(0, 2).toUpperCase()
})

const usuarioActual = computed(() => ({
  nombre: nombreUsuario.value,
  rol: rolUsuario.value,
  iniciales: iniciales.value
}))

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
    await router.push('/login')
  } finally {
    cerrando.value = false
  }
}
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    
    <aside class="w-64 bg-[#0f172a] text-slate-300 flex flex-col shadow-xl z-20">
      <div class="p-6 border-b border-slate-800 flex items-center justify-center h-[73px] shrink-0 bg-white">
        <img :src="imagotipoUrl" alt="UrbanSphere Admin" class="h-9 object-contain" />
      </div>
      
      <div class="p-4 uppercase text-[10px] font-bold text-slate-500 tracking-wider">Menú Principal</div>
      <nav class="flex-1 px-4 flex flex-col gap-1 mt-2">
        <router-link to="/admin/nuevo-proyecto" class="flex items-center gap-3 px-3 py-3 hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors" active-class="bg-[#003399] text-white font-bold hover:bg-[#003399]">
          <FileText class="w-4 h-4" /> Proyectos
        </router-link>
        <router-link v-if="puedeVerUsuarios" to="/admin/usuarios" class="flex items-center gap-3 px-3 py-3 hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors" active-class="bg-[#003399] text-white font-bold hover:bg-[#003399]">
          <Users class="w-4 h-4" /> Usuarios
        </router-link>
      </nav>
      
      <div class="p-4 border-t border-slate-800 flex flex-col gap-2">
        <router-link to="/" class="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors text-slate-300">
          <Home class="w-4 h-4" /> Inicio
        </router-link>
        <router-link to="/catalogo" class="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors text-slate-300">
          <Compass class="w-4 h-4" /> Catálogo
        </router-link>
        <button @click="manejarCerrarSesion" :disabled="cerrando" class="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg font-medium text-sm text-red-400 mt-2 cursor-pointer transition-colors text-left disabled:opacity-50">
          <LogOut class="w-4 h-4" /> {{ cerrando ? 'Saliendo...' : 'Cerrar Sesión' }}
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="bg-white border-b border-slate-200 h-[75px] flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div class="text-sm text-slate-500 font-bold flex items-center gap-2">
          <span>Panel</span>
          <span class="text-slate-300">/</span> 
          <span class="text-[#003399] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">{{ titulo ?? 'Inicio' }}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="font-black text-slate-800 text-sm leading-none mb-1">{{ usuarioActual.nombre }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{{ usuarioActual.rol }}</p>
          </div>
          <div class="w-10 h-10 bg-gradient-to-tr from-[#003399] to-blue-400 text-white rounded-full flex items-center justify-center font-black text-sm shadow-md border-2 border-white">{{ usuarioActual.iniciales }}</div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
