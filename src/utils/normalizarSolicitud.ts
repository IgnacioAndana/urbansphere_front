import type { EstadoSolicitud, SolicitudContacto, SolicitudInteres } from '../types/usuarios'

function campoTexto(raw: Record<string, unknown>, ...claves: string[]): string | null {
  for (const k of claves) {
    const v = raw[k]
    if (typeof v === 'string' && v.trim()) return v
  }
  return null
}

function campoEstado(raw: Record<string, unknown>): EstadoSolicitud | undefined {
  const v = raw.estado
  if (v === 'pendiente' || v === 'resuelta') return v
  return undefined
}

export function normalizarSolicitudInteres(raw: unknown): SolicitudInteres | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = Number(r.id)
  const proyectoId = Number(r.proyectoId ?? r.proyecto_id)
  if (Number.isNaN(id) || Number.isNaN(proyectoId)) return null
  return {
    id,
    proyectoId,
    nombre: String(r.nombre ?? ''),
    email: String(r.email ?? ''),
    usuarioId: r.usuarioId != null ? Number(r.usuarioId ?? r.usuario_id) : null,
    estado: campoEstado(r),
    observacionAgente: campoTexto(r, 'observacionAgente', 'observacion_agente'),
    fechaCierre: campoTexto(r, 'fechaCierre', 'fecha_cierre'),
    creadoEn: campoTexto(r, 'creadoEn', 'creado_en') ?? undefined,
  }
}

export function normalizarSolicitudContacto(raw: unknown): SolicitudContacto | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = Number(r.id)
  if (Number.isNaN(id)) return null
  return {
    id,
    nombreCompleto: String(r.nombreCompleto ?? r.nombre_completo ?? ''),
    email: String(r.email ?? ''),
    mensaje: String(r.mensaje ?? ''),
    estado: campoEstado(r),
    observacionAgente: campoTexto(r, 'observacionAgente', 'observacion_agente'),
    fechaCierre: campoTexto(r, 'fechaCierre', 'fecha_cierre'),
    creadoEn: campoTexto(r, 'creadoEn', 'creado_en') ?? undefined,
  }
}
