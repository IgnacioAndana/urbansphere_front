import { ref, computed } from 'vue'
import { authService } from '../services/usuarios'
import { puedeAccederPanelAdmin } from '../constants/roles'

const nombre = ref<string | null>(null)
const rolId = ref<number | null>(null)
const rolNombre = ref<string | null>(null)
const cargando = ref(false)

export function useSesion() {
  const autenticado = computed(() => authService.estaAutenticado())
  const accesoAdmin = computed(() => puedeAccederPanelAdmin(rolId.value))

  async function cargarSesion() {
    if (!authService.estaAutenticado()) {
      nombre.value = null
      rolId.value = null
      rolNombre.value = null
      return
    }

    const local = authService.obtenerUsuarioLocal()
    if (local?.nombre) nombre.value = local.nombre
    rolId.value = authService.obtenerRolIdLocal()
    rolNombre.value = authService.obtenerRolNombreLocal()

    cargando.value = true
    try {
      const perfil = await authService.obtenerPerfil()
      nombre.value = perfil.nombre
      rolId.value = authService.obtenerRolIdLocal()
      rolNombre.value = authService.obtenerRolNombreLocal()
    } catch {
      // Se mantiene la info cacheada del login
    } finally {
      cargando.value = false
    }
  }

  async function cerrarSesion() {
    await authService.cerrarSesion()
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
