/** IDs de roles según seed en context/init-all.sql */
export const ROLES = {
  ADMIN: 1,
  USER: 2,
  AGENT: 3,
} as const

export type RolId = (typeof ROLES)[keyof typeof ROLES]

export function puedeAccederPanelAdmin(rolId: number | null | undefined): boolean {
  return rolId === ROLES.ADMIN || rolId === ROLES.AGENT
}

export function esUsuarioEstandar(rolId: number | null | undefined): boolean {
  return rolId === ROLES.USER
}
