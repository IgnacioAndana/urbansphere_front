/** IDs de roles — context/Readme_ms_usuarios.md */
export const ROLES = {
  ADMIN: 1,
  USER: 2,
  AGENT: 3,
} as const

export type RolId = (typeof ROLES)[keyof typeof ROLES]

export const DESCRIPCION_ROLES: Record<number, string> = {
  [ROLES.ADMIN]: 'Acceso completo; crear y eliminar usuarios',
  [ROLES.USER]: 'Ver proyectos y enviar solicitudes de interés',
  [ROLES.AGENT]: 'Panel admin sin crear/eliminar usuarios',
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
