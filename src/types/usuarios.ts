/**
 * Tipos del MS Usuarios — context/Readme_ms_usuarios.md
 *
 * Roles fijos: admin (1), user (2), agent (3)
 * Permisos por rol en código (sin tablas permisos/rol_permisos)
 */

/** Rol del sistema: admin | user | agent */
export interface Rol {
  id: number
  nombre: string
  descripcion?: string
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

/** Perfil del usuario autenticado (GET /autenticacion/perfil) */
export type PerfilUsuario = Usuario

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

export interface SolicitarRestablecimientoDto {
  email: string
}

export interface SolicitarRestablecimientoRespuesta {
  mensaje: string
  email: string
}

export interface ValidarTokenRestablecimientoDto {
  token: string
}

export interface RestablecerContrasenaDto {
  token: string
  contrasena: string
}

// --- CRUD usuarios ---

/** Registro público (sin JWT) — siempre rol user */
export interface RegistrarUsuarioDto {
  nombre: string
  email: string
  contrasena: string
}

/** Crear usuario con rol — solo admin autenticado */
export interface CrearUsuarioAdminDto extends RegistrarUsuarioDto {
  rolId: number
}

/** Propio perfil: nombre, email, contrasena. Admin/agent además: rolId, activo */
export interface ActualizarUsuarioDto {
  nombre?: string
  email?: string
  contrasena?: string
  rolId?: number
  activo?: boolean
}

/** Actualización del perfil propio (user, admin, agent) */
export interface ActualizarPerfilPropioDto {
  nombre?: string
  email?: string
  contrasena?: string
}

// --- Solicitudes de interés ---

export interface SolicitudInteresDto {
  proyectoId: number
  nombre: string
  email: string
}

export interface SolicitudInteres extends SolicitudInteresDto {
  id: number
  usuarioId?: number | null
  creadoEn?: string
}

export interface SolicitudContactoDto {
  nombreCompleto: string
  email: string
  mensaje: string
}

export interface SolicitudContacto extends SolicitudContactoDto {
  id: number
  creadoEn?: string
}

/** Respuesta de error estándar del BFF / NestJS */
export interface ApiErrorBody {
  message?: string | ApiErrorBody
  error?: string
  statusCode?: number
  codigoEstado?: number
  mensaje?: string | ApiErrorBody
}
