<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Building2, Users, LogOut, Home, LayoutGrid, Menu, X, User, ChevronDown, List, FolderPlus, Inbox } from 'lucide-vue-next'
import imagotipoUrl from '../assets/UrbanSphere-Imagotipo.png'
import { useSesion } from '../composables/useSesion'
import { nombreRolPorId } from '../constants/roles'

defineProps<{
  titulo?: string
}>()

const router = useRouter()
const route = useRoute()
const { nombre, rolId, puedeVerUsuarios, accesoAdmin, cargarSesion, cerrarSesion } = useSesion()

const nombreUsuario = ref('Administrador')
const rolUsuario = ref('Admin')
const cerrando = ref(false)
const menuAbierto = ref(false)
const proyectosAbierto = ref(false)

const esRutaProyectos = computed(() => route.path.startsWith('/admin/proyectos'))

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
  proyectosAbierto.value = esRutaProyectos.value
})

watch(
  () => route.path,
  () => {
    menuAbierto.value = false
    if (esRutaProyectos.value) proyectosAbierto.value = true
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
  <div class="flex h-screen bg-slate-50 overflow-hidden relative">
    
    <div v-if="menuAbierto" class="fixed inset-0 bg-slate-900/50 z-20 md:hidden" @click="menuAbierto = false"></div>

    <aside :class="['w-64 bg-white text-slate-700 flex flex-col shadow-xl z-30 transition-transform absolute md:relative h-full', menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0']">
      <div class="p-6 border-b border-slate-200 flex items-center justify-between h-[73px] shrink-0">
        <img :src="imagotipoUrl" alt="UrbanSphere Admin" class="h-9 object-contain" />
        <button @click="menuAbierto = false" class="md:hidden text-slate-400 hover:text-slate-600">
          <X class="w-6 h-6" />
        </button>
      </div>
      
      <div class="p-4 uppercase text-[10px] font-bold text-slate-400 tracking-wider">Menú Principal</div>
      <nav class="flex-1 px-4 flex flex-col gap-1 mt-2 overflow-y-auto">
        <!-- Proyectos (desplegable) -->
        <div>
          <button
            type="button"
            class="w-full flex items-center justify-between gap-3 px-3 py-3 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors text-slate-600"
            :class="esRutaProyectos ? 'bg-[#003399]/10 text-[#003399] font-bold' : ''"
            @click="proyectosAbierto = !proyectosAbierto"
          >
            <span class="flex items-center gap-3">
              <Building2 class="w-4 h-4" /> Proyectos
            </span>
            <ChevronDown class="w-4 h-4 transition-transform" :class="proyectosAbierto ? 'rotate-180' : ''" />
          </button>
          <div v-show="proyectosAbierto" class="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-slate-100 pl-3">
            <router-link
              to="/admin/proyectos"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              active-class="!text-[#003399] !bg-[#003399]/10 !font-bold"
            >
              <List class="w-3.5 h-3.5" /> Listado
            </router-link>
            <router-link
              to="/admin/proyectos/nuevo"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              active-class="!text-[#003399] !bg-[#003399]/10 !font-bold"
            >
              <FolderPlus class="w-3.5 h-3.5" /> Nuevo proyecto
            </router-link>
          </div>
        </div>

        <router-link v-if="accesoAdmin" to="/admin/solicitudes" class="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors text-slate-600" active-class="bg-[#003399]/10 text-[#003399] font-bold hover:bg-[#003399]/10">
          <Inbox class="w-4 h-4" /> Solicitudes
        </router-link>

        <router-link v-if="puedeVerUsuarios" to="/admin/usuarios" class="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors text-slate-600" active-class="bg-[#003399]/10 text-[#003399] font-bold hover:bg-[#003399]/10">
          <Users class="w-4 h-4" /> Usuarios
        </router-link>
      </nav>
      
      <div class="p-4 border-t border-slate-200 flex flex-col gap-2 shrink-0">
        <router-link to="/admin/perfil" class="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors text-slate-600">
          <User class="w-4 h-4" /> Mi perfil
        </router-link>
        <router-link to="/" class="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors text-slate-600">
          <Home class="w-4 h-4" /> Inicio
        </router-link>
        <router-link to="/catalogo" class="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors text-slate-600">
          <LayoutGrid class="w-4 h-4" /> Catálogo
        </router-link>
        <button @click="manejarCerrarSesion" :disabled="cerrando" class="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg font-medium text-sm text-red-500 mt-2 cursor-pointer transition-colors text-left disabled:opacity-50">
          <LogOut class="w-4 h-4" /> {{ cerrando ? 'Saliendo...' : 'Cerrar Sesión' }}
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden w-full">
      <header class="bg-white border-b border-slate-200 h-[75px] flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm">
        <div class="flex items-center gap-3">
          <button @click="menuAbierto = true" class="md:hidden text-slate-500 hover:text-[#003399]">
            <Menu class="w-6 h-6" />
          </button>
          <div class="text-sm text-slate-500 font-bold flex items-center gap-2">
            <span class="hidden sm:inline">Panel</span>
            <span class="hidden sm:inline text-slate-300">/</span> 
            <span class="text-[#003399] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">{{ titulo ?? 'Inicio' }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="font-black text-slate-800 text-sm leading-none mb-1">{{ usuarioActual.nombre }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{{ usuarioActual.rol }}</p>
          </div>
          <router-link to="/admin/perfil" class="w-10 h-10 bg-gradient-to-tr from-[#003399] to-blue-400 text-white rounded-full flex items-center justify-center font-black text-sm shadow-md border-2 border-white hover:opacity-90 transition-opacity" title="Mi perfil">
            {{ usuarioActual.iniciales }}
          </router-link>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
