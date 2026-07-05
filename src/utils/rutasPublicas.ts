/** Rutas del front accesibles sin sesión (visitante anónimo). */
const RUTAS_PUBLICAS_EXACTAS = new Set([
  '/',
  '/login',
  '/registro',
  '/catalogo',
  '/contacto',
  '/olvide-contrasena',
  '/restablecer-contrasena',
])

export function normalizarPathname(pathname: string): string {
  const sinQuery = pathname.split('?')[0] ?? '/'
  if (sinQuery === '/') return '/'
  return sinQuery.replace(/\/+$/, '') || '/'
}

export function esRutaPublicaApp(pathname: string): boolean {
  const path = normalizarPathname(pathname)
  if (RUTAS_PUBLICAS_EXACTAS.has(path)) return true
  return /^\/propiedad\/\d+$/.test(path)
}
