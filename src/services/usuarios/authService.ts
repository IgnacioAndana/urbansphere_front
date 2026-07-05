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
import api, { STORAGE_KEYS, limpiarSesionLocal } from '../api'
import type {
  CerrarSesionDto,
  IniciarSesionDto,
  IniciarSesionRespuesta,
  PerfilUsuario,
  RefrescarTokenDto,
  RefrescarTokenRespuesta,
  RestablecerContrasenaDto,
  Rol,
  SolicitarRestablecimientoDto,
  SolicitarRestablecimientoRespuesta,
  ValidarTokenRestablecimientoDto,
} from '../../types/usuarios'
import { esAdmin, esUsuarioEstandar, puedeAccederPanelAdmin, ROLES } from '../../constants/roles'
import { obtenerIdUsuarioDesdeToken, tokenJwtExpirado } from '../../utils/jwt'

type UsuarioSesion = IniciarSesionRespuesta['usuario'] | PerfilUsuario

/** La API puede devolver rolId, rol_id o solo rol { id, nombre } */
function extraerRolId(usuario: Record<string, unknown>): number | null {
  const rol = usuario.rol as { id?: number | string; nombre?: string } | undefined
  const raw = usuario.rolId ?? usuario.rol_id ?? rol?.id

  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw
  if (typeof raw === 'string') {
    const parsed = Number(raw)
    if (!Number.isNaN(parsed)) return parsed
  }

  const nombreRol = rol?.nombre?.toLowerCase()
  if (nombreRol === 'admin') return ROLES.ADMIN
  if (nombreRol === 'user') return ROLES.USER
  if (nombreRol === 'agent') return ROLES.AGENT

  return null
}

function construirRol(rolId: number, rolRaw?: { id?: number; nombre?: string; descripcion?: string }): Rol {
  if (rolRaw?.id && rolRaw.nombre) {
    return { id: rolRaw.id, nombre: rolRaw.nombre, descripcion: rolRaw.descripcion }
  }
  const nombre = rolId === ROLES.ADMIN ? 'admin' : rolId === ROLES.AGENT ? 'agent' : 'user'
  return { id: rolId, nombre }
}

function normalizarUsuario(raw: unknown): UsuarioSesion | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const rolId = extraerRolId(data)
  const rolRaw = data.rol as { id?: number; nombre?: string; descripcion?: string } | undefined

  return {
    ...(data as UsuarioSesion),
    rolId: rolId ?? undefined,
    rol: rolId ? construirRol(rolId, rolRaw) : undefined,
  }
}

function guardarSesion(
  data: IniciarSesionRespuesta | RefrescarTokenRespuesta,
  usuario?: UsuarioSesion,
) {
  localStorage.setItem(STORAGE_KEYS.tokenAcceso, data.tokenAcceso)
  localStorage.setItem(STORAGE_KEYS.tokenRefresco, data.tokenRefresco)
  if (usuario) {
    const normalizado = normalizarUsuario(usuario)
    if (normalizado) {
      localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(normalizado))
    }
  }
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
    const normalizado = normalizarUsuario(data) ?? data
    localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(normalizado))
    return normalizado as PerfilUsuario
  },

  /** Usuario cacheado en localStorage (tras login o perfil) */
  obtenerUsuarioLocal(): UsuarioSesion | null {
    const raw = localStorage.getItem(STORAGE_KEYS.usuario)
    if (!raw) return null
    try {
      return normalizarUsuario(JSON.parse(raw))
    } catch {
      return null
    }
  },

  obtenerRolIdLocal(): number | null {
    const usuario = this.obtenerUsuarioLocal()
    if (!usuario) return null
    return extraerRolId(usuario as unknown as Record<string, unknown>)
  },

  obtenerRolNombreLocal(): string | null {
    const usuario = this.obtenerUsuarioLocal()
    if (!usuario) return null
    return usuario.rol?.nombre ?? null
  },

  obtenerUsuarioIdLocal(): number | null {
    const token = localStorage.getItem(STORAGE_KEYS.tokenAcceso)
    const idJwt = obtenerIdUsuarioDesdeToken(token)
    if (idJwt !== null) return idJwt
    return this.obtenerUsuarioLocal()?.id ?? null
  },

  obtenerEmailLocal(): string | null {
    const usuario = this.obtenerUsuarioLocal()
    return usuario?.email ?? null
  },

  puedeAccederPanelAdmin(): boolean {
    return puedeAccederPanelAdmin(this.obtenerRolIdLocal())
  },

  esAdmin(): boolean {
    return esAdmin(this.obtenerRolIdLocal())
  },

  esUsuarioEstandar(): boolean {
    return esUsuarioEstandar(this.obtenerRolIdLocal())
  },

  /**
   * POST /autenticacion/solicitar-restablecimiento
   * Usado en: OlvideContrasenaView.vue
   */
  async solicitarRestablecimiento(dto: SolicitarRestablecimientoDto): Promise<SolicitarRestablecimientoRespuesta> {
    const { data } = await api.post<SolicitarRestablecimientoRespuesta>(
      '/autenticacion/solicitar-restablecimiento',
      dto,
    )
    return data
  },

  /**
   * POST /autenticacion/validar-token-restablecimiento
   * Usado en: RestablecerContrasenaView.vue
   */
  async validarTokenRestablecimiento(dto: ValidarTokenRestablecimientoDto): Promise<void> {
    await api.post('/autenticacion/validar-token-restablecimiento', dto)
  },

  /**
   * POST /autenticacion/restablecer-contrasena
   * Usado en: RestablecerContrasenaView.vue
   */
  async restablecerContrasena(dto: RestablecerContrasenaDto): Promise<void> {
    await api.post('/autenticacion/restablecer-contrasena', dto)
  },

  estaAutenticado(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.tokenAcceso)
    if (!token) return false
    if (!tokenJwtExpirado(token)) return true
    return Boolean(localStorage.getItem(STORAGE_KEYS.tokenRefresco))
  },
}
