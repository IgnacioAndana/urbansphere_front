import { ref, computed } from 'vue'
import { authService } from '../services/usuarios'
import { puedeAccederPanelAdmin } from '../constants/roles'

const sesionActiva = ref(false)
const nombre = ref<string | null>(null)
const rolId = ref<number | null>(null)
const rolNombre = ref<string | null>(null)
const cargando = ref(false)

function aplicarEstadoLocal() {
  sesionActiva.value = authService.estaAutenticado()

  if (!sesionActiva.value) {
    nombre.value = null
    rolId.value = null
    rolNombre.value = null
    return
  }

  const local = authService.obtenerUsuarioLocal()
  nombre.value = local?.nombre ?? null
  rolId.value = authService.obtenerRolIdLocal()
  rolNombre.value = authService.obtenerRolNombreLocal()
}

export function useSesion() {
  const autenticado = computed(() => sesionActiva.value)
  const accesoAdmin = computed(() => puedeAccederPanelAdmin(rolId.value))

  async function cargarSesion() {
    aplicarEstadoLocal()
    if (!sesionActiva.value) return

    cargando.value = true
    try {
      await authService.obtenerPerfil()
      aplicarEstadoLocal()
    } catch {
      // Se mantiene la info cacheada del login
    } finally {
      cargando.value = false
    }
  }

  async function cerrarSesion() {
    await authService.cerrarSesion()
    sesionActiva.value = false
    nombre.value = null
    rolId.value = null
    rolNombre.value = null
  }

  return {
    autenticado,
    accesoAdmin,
    nombre,
    rolId,
    rolNombre,
    cargando,
    cargarSesion,
    cerrarSesion,
  }
}
