/**
 * MS Usuarios — Autenticación
 *
 * Endpoints (prefijo /api vía BFF):
 * | Método | Ruta                              | Auth | Componente(s)        |
 * |--------|-----------------------------------|------|----------------------|
 * | POST   | /autenticacion/iniciar-sesion     | No   | LoginView.vue        |
 * | POST   | /autenticacion/refrescar          | No   | api.ts (interceptor) |
 * | POST   | /autenticacion/cerrar-sesion      | No   | AdminLayout.vue      |
 * | GET    | /autenticacion/perfil             | JWT  | AdminLayout.vue      |
 *
 * Flujo BD: login valida email + hash_contrasena (tabla usuarios),
 * genera JWT (15 min) y guarda token_refresco (7 días en tokens_refresco).
 *
 * Usuario admin de prueba: juan@example.com (rol admin, rol_id → tabla roles)
 */
import api, { STORAGE_KEYS } from '../api'
import type {
  CerrarSesionDto,
  IniciarSesionDto,
  IniciarSesionRespuesta,
  PerfilUsuario,
  RefrescarTokenDto,
  RefrescarTokenRespuesta,
} from '../../types/usuarios'
import { esUsuarioEstandar, puedeAccederPanelAdmin } from '../../constants/roles'

type UsuarioSesion = IniciarSesionRespuesta['usuario'] | PerfilUsuario

function guardarSesion(
  data: IniciarSesionRespuesta | RefrescarTokenRespuesta,
  usuario?: UsuarioSesion,
) {
  localStorage.setItem(STORAGE_KEYS.tokenAcceso, data.tokenAcceso)
  localStorage.setItem(STORAGE_KEYS.tokenRefresco, data.tokenRefresco)
  if (usuario) {
    localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(usuario))
  }
}

function limpiarSesionLocal() {
  localStorage.removeItem(STORAGE_KEYS.tokenAcceso)
  localStorage.removeItem(STORAGE_KEYS.tokenRefresco)
  localStorage.removeItem(STORAGE_KEYS.usuario)
}

export const authService = {
  /**
   * POST /autenticacion/iniciar-sesion
   * Usado en: LoginView.vue
   */
  async iniciarSesion(credentials: IniciarSesionDto): Promise<IniciarSesionRespuesta> {
    const { data } = await api.post<IniciarSesionRespuesta>('/autenticacion/iniciar-sesion', credentials)
    guardarSesion(data, data.usuario)
    return data
  },

  /**
   * POST /autenticacion/refrescar
   * Renueva tokenAcceso cuando expira el JWT (15 min).
   */
  async refrescarToken(): Promise<RefrescarTokenRespuesta> {
    const tokenRefresco = localStorage.getItem(STORAGE_KEYS.tokenRefresco)
    if (!tokenRefresco) throw new Error('No hay token de refresco')

    const body: RefrescarTokenDto = { tokenRefresco }
    const { data } = await api.post<RefrescarTokenRespuesta>('/autenticacion/refrescar', body)
    guardarSesion(data)
    return data
  },

  /**
   * POST /autenticacion/cerrar-sesion
   * Usado en: AdminLayout.vue — invalida token_refresco en BD.
   */
  async cerrarSesion(): Promise<void> {
    const tokenRefresco = localStorage.getItem(STORAGE_KEYS.tokenRefresco)
    try {
      if (tokenRefresco) {
        const body: CerrarSesionDto = { tokenRefresco }
        await api.post('/autenticacion/cerrar-sesion', body)
      }
    } finally {
      limpiarSesionLocal()
    }
  },

  /**
   * GET /autenticacion/perfil
   * Usado en: AdminLayout.vue — datos del usuario logueado + rol/permisos.
   */
  async obtenerPerfil(): Promise<PerfilUsuario> {
    const { data } = await api.get<PerfilUsuario>('/autenticacion/perfil')
    localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(data))
    return data
  },

  /** Usuario cacheado en localStorage (tras login o perfil) */
  obtenerUsuarioLocal(): UsuarioSesion | null {
    const raw = localStorage.getItem(STORAGE_KEYS.usuario)
    if (!raw) return null
    try {
      return JSON.parse(raw) as UsuarioSesion
    } catch {
      return null
    }
  },

  obtenerRolIdLocal(): number | null {
    const usuario = this.obtenerUsuarioLocal()
    if (!usuario) return null
    return usuario.rolId ?? usuario.rol?.id ?? null
  },

  obtenerRolNombreLocal(): string | null {
    const usuario = this.obtenerUsuarioLocal()
    if (!usuario) return null
    return usuario.rol?.nombre ?? null
  },

  puedeAccederPanelAdmin(): boolean {
    return puedeAccederPanelAdmin(this.obtenerRolIdLocal())
  },

  esUsuarioEstandar(): boolean {
    return esUsuarioEstandar(this.obtenerRolIdLocal())
  },

  estaAutenticado(): boolean {
    return Boolean(localStorage.getItem(STORAGE_KEYS.tokenAcceso))
  },
}
