/**
 * Tipos del MS Usuarios — alineados con context/init-all.sql y Readme_ms_usuarios.md
 *
 * Tablas BD (esquema porsusde_urbansphere):
 * - usuarios: id, uuid, nombre, email, hash_contrasena, rol_id, activo, creado_en, actualizado_en
 * - roles: id, nombre, descripcion
 * - permisos: id, nombre
 * - tokens_refresco: usuario_id, token, expira_en
 *
 * La API expone JSON en español (camelCase) y fechas como dd-mm-yyyy HH:mm:ss.
 */

/** Rol del sistema: admin | user | agent (tabla `roles`) */
export interface Rol {
  id: number
  nombre: string
  descripcion?: string
}

/** Permiso granular (tabla `permisos`, ej. users.read) */
export interface Permiso {
  id: number
  nombre: string
}

/** Usuario tal como lo devuelve la API (sin hash_contrasena) */
export interface Usuario {
  id: number
  nombre: string
  email: string
  rolId?: number
  rol?: Rol
  activo?: boolean
  creadoEn?: string
  actualizadoEn?: string
}

/** Perfil extendido del usuario autenticado (GET /autenticacion/perfil) */
export interface PerfilUsuario extends Usuario {
  permisos?: Permiso[]
}

// --- Autenticación ---

export interface IniciarSesionDto {
  email: string
  contrasena: string
}

export interface IniciarSesionRespuesta {
  tokenAcceso: string
  tokenRefresco: string
  expiraEn: string
  usuario: Pick<Usuario, 'id' | 'nombre' | 'email' | 'creadoEn' | 'rolId' | 'rol'>
}

export interface RefrescarTokenDto {
  tokenRefresco: string
}

export interface RefrescarTokenRespuesta {
  tokenAcceso: string
  tokenRefresco: string
  expiraEn: string
}

export interface CerrarSesionDto {
  tokenRefresco: string
}

// --- CRUD usuarios ---

export interface RegistrarUsuarioDto {
  nombre: string
  email: string
  contrasena: string
  /** Opcional; por defecto el MS asigna rol `user` (rol_id = 2) */
  rolId?: number
}

export interface ActualizarUsuarioDto {
  nombre?: string
  email?: string
  contrasena?: string
  rolId?: number
  activo?: boolean
}

/** Respuesta de error estándar del BFF / NestJS */
export interface ApiErrorBody {
  message?: string | ApiErrorBody
  error?: string
  statusCode?: number
  codigoEstado?: number
  mensaje?: string | ApiErrorBody
}
