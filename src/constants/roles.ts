/** IDs de roles — context/Readme_ms_usuarios.md */
export const ROLES = {
  ADMIN: 1,
  USER: 2,
  AGENT: 3,
} as const

export type RolId = (typeof ROLES)[keyof typeof ROLES]

export const NOMBRE_ROL_ES: Record<number, string> = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'Usuario',
  [ROLES.AGENT]: 'Agente',
}

export const DESCRIPCION_ROLES: Record<number, string> = {
  [ROLES.ADMIN]: 'Acceso completo; crear y eliminar usuarios',
  [ROLES.USER]: 'Ver proyectos y enviar solicitudes de interés',
  [ROLES.AGENT]: 'Panel admin sin crear/eliminar usuarios',
}

/** Extrae rol_id / rolId / rol.id de respuestas API */
export function extraerRolIdDeUsuario(usuario: Record<string, unknown>): number | null {
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

export function nombreRolPorId(rolId: number | null | undefined): string {
  if (rolId == null || Number.isNaN(rolId)) return '—'
  return NOMBRE_ROL_ES[rolId] ?? '—'
}

export function nombreRolDeUsuario(usuario: Record<string, unknown>): string {
  const id = extraerRolIdDeUsuario(usuario)
  if (id !== null) return nombreRolPorId(id)

  const nombre = (usuario.rol as { nombre?: string } | undefined)?.nombre?.toLowerCase()
  if (nombre === 'admin') return 'Admin'
  if (nombre === 'user') return 'Usuario'
  if (nombre === 'agent') return 'Agente'

  return '—'
}

export function idsUsuarioCoinciden(a: unknown, b: unknown): boolean {
  const na = Number(a)
  const nb = Number(b)
  return !Number.isNaN(na) && !Number.isNaN(nb) && na === nb
}

export function esAdmin(rolId: number | null | undefined): boolean {
  return rolId === ROLES.ADMIN
}

export function esAgent(rolId: number | null | undefined): boolean {
  return rolId === ROLES.AGENT
}

export function puedeAccederPanelAdmin(rolId: number | null | undefined): boolean {
  return esAdmin(rolId) || esAgent(rolId)
}

export function esUsuarioEstandar(rolId: number | null | undefined): boolean {
  return rolId === ROLES.USER
}

/** GET /usuarios — admin y agent */
export function puedeListarUsuarios(rolId: number | null | undefined): boolean {
  return esAdmin(rolId) || esAgent(rolId)
}

/** POST (con JWT) y DELETE /usuarios — solo admin */
export function puedeGestionarUsuarios(rolId: number | null | undefined): boolean {
  return esAdmin(rolId)
}
