import { ROLES } from '../constants/roles'
import type { Rol, Usuario } from '../types/usuarios'

/** Alinea respuestas API (rol_id, rol anidado, etc.) al tipo Usuario del front */
export function normalizarUsuarioApi(raw: unknown): Usuario | null {
  if (!raw || typeof raw !== 'object') return null

  const data = raw as Record<string, unknown>
  const rolRaw = data.rol as { id?: number | string; nombre?: string; descripcion?: string } | undefined
  const rolIdRaw = data.rolId ?? data.rol_id ?? rolRaw?.id

  let rolId: number | undefined
  if (typeof rolIdRaw === 'number' && !Number.isNaN(rolIdRaw)) {
    rolId = rolIdRaw
  } else if (typeof rolIdRaw === 'string') {
    const parsed = Number(rolIdRaw)
    if (!Number.isNaN(parsed)) rolId = parsed
  }

  if (rolId == null && rolRaw?.nombre) {
    const nombre = rolRaw.nombre.toLowerCase()
    if (nombre === 'admin') rolId = ROLES.ADMIN
    else if (nombre === 'user') rolId = ROLES.USER
    else if (nombre === 'agent') rolId = ROLES.AGENT
  }

  let rol: Rol | undefined
  if (rolId != null) {
    rol =
      rolRaw?.id && rolRaw.nombre
        ? {
            id: Number(rolRaw.id),
            nombre: rolRaw.nombre,
            descripcion: rolRaw.descripcion,
          }
        : {
            id: rolId,
            nombre: rolId === ROLES.ADMIN ? 'admin' : rolId === ROLES.AGENT ? 'agent' : 'user',
          }
  }

  const idRaw = data.id
  const id = typeof idRaw === 'string' ? Number(idRaw) : (idRaw as number)

  return {
    id,
    nombre: String(data.nombre ?? ''),
    email: String(data.email ?? ''),
    rolId,
    rol,
    activo: data.activo !== false,
    creadoEn: data.creadoEn as string | undefined,
    actualizadoEn: data.actualizadoEn as string | undefined,
  }
}
