/** Decodifica el payload de un JWT (sin verificar firma — solo lectura del id en cliente). */
export function decodificarPayloadJwt(token: string): Record<string, unknown> | null {
  try {
    const parte = token.split('.')[1]
    if (!parte) return null
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

/** Id del usuario autenticado según el JWT (debe coincidir con lo que valida el backend). */
export function obtenerIdUsuarioDesdeToken(token: string | null): number | null {
  if (!token) return null

  const payload = decodificarPayloadJwt(token)
  if (!payload) return null

  const raw = payload.sub ?? payload.id ?? payload.userId ?? payload.usuarioId

  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw
  if (typeof raw === 'string') {
    const parsed = Number(raw)
    if (!Number.isNaN(parsed)) return parsed
  }

  return null
}
