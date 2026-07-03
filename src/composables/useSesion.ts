import { ref, computed } from 'vue'
import { authService } from '../services/usuarios'
import {
  esAdmin,
  puedeAccederPanelAdmin,
  puedeGestionarUsuarios,
  puedeListarUsuarios,
} from '../constants/roles'

const sesionActiva = ref(false)
const nombre = ref<string | null>(null)
const email = ref<string | null>(null)
const usuarioId = ref<number | null>(null)
const rolId = ref<number | null>(null)
const rolNombre = ref<string | null>(null)
const cargando = ref(false)

function aplicarEstadoLocal() {
  sesionActiva.value = authService.estaAutenticado()

  if (!sesionActiva.value) {
    nombre.value = null
    email.value = null
    usuarioId.value = null
    rolId.value = null
    rolNombre.value = null
    return
  }

  const local = authService.obtenerUsuarioLocal()
  nombre.value = local?.nombre ?? null
  email.value = local?.email ?? null
  usuarioId.value = authService.obtenerUsuarioIdLocal()
  rolId.value = authService.obtenerRolIdLocal()
  rolNombre.value = authService.obtenerRolNombreLocal()
}

export function useSesion() {
  const autenticado = computed(() => sesionActiva.value)
  const accesoAdmin = computed(() => puedeAccederPanelAdmin(rolId.value))
  const esAdminRol = computed(() => esAdmin(rolId.value))
  const puedeVerUsuarios = computed(() => puedeListarUsuarios(rolId.value))
  const puedeCrearEliminarUsuarios = computed(() => puedeGestionarUsuarios(rolId.value))

  async function cargarSesion() {
    aplicarEstadoLocal()
    if (!sesionActiva.value) return

    cargando.value = true
    try {
      await authService.obtenerPerfil()
      aplicarEstadoLocal()
    } catch {
      if (!authService.estaAutenticado()) {
        aplicarEstadoLocal()
      }
    } finally {
      cargando.value = false
    }
  }

  async function cerrarSesion() {
    await authService.cerrarSesion()
    sesionActiva.value = false
    nombre.value = null
    email.value = null
    usuarioId.value = null
    rolId.value = null
    rolNombre.value = null
  }

  return {
    autenticado,
    accesoAdmin,
    esAdminRol,
    puedeVerUsuarios,
    puedeCrearEliminarUsuarios,
    nombre,
    email,
    usuarioId,
    rolId,
    rolNombre,
    cargando,
    cargarSesion,
    cerrarSesion,
  }
}
