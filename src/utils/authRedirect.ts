import type { Router } from 'vue-router'
import { authService } from '../services/usuarios'
import { esUsuarioEstandar, puedeAccederPanelAdmin } from '../constants/roles'

const RUTAS_SIN_RETURN_TO = [
  '/login',
  '/registro',
  '/olvide-contrasena',
  '/restablecer-contrasena',
]

/** Evita open redirects; solo rutas internas relativas */
export function parseReturnTo(valor: unknown): string | null {
  if (typeof valor !== 'string') return null
  const path = valor.trim()
  if (!path.startsWith('/') || path.startsWith('//')) return null
  if (path.startsWith('/login')) return null
  return path
}

/** Query para enlaces a login desde una ruta pública o protegida */
export function queryLoginDesde(path: string, fullPath: string): { returnTo?: string } {
  if (RUTAS_SIN_RETURN_TO.includes(path)) return {}
  return { returnTo: fullPath }
}

/** Ruta destino tras login según rol_id (admin=1, user=2, agent=3) */
export function rutaPostLogin(): string {
  const rolId = authService.obtenerRolIdLocal()
  if (esUsuarioEstandar(rolId)) return '/'
  if (puedeAccederPanelAdmin(rolId)) return '/admin/proyectos'
  return '/'
}

export function destinoTrasLogin(returnTo: unknown): string {
  const destino = parseReturnTo(returnTo)
  const rolId = authService.obtenerRolIdLocal()

  if (destino) {
    if (destino.startsWith('/admin')) {
      if (puedeAccederPanelAdmin(rolId)) return destino
    } else if (destino === '/reservas') {
      return destino
    } else if (!RUTAS_SIN_RETURN_TO.some((r) => destino.startsWith(r))) {
      return destino
    }
  }

  return rutaPostLogin()
}

export async function redirigirTrasLogin(router: Router, returnTo?: unknown): Promise<void> {
  await authService.obtenerPerfil()
  await router.push(destinoTrasLogin(returnTo))
}

export function rutaSiYaAutenticado(): string | null {
  if (!authService.estaAutenticado()) return null
  return rutaPostLogin()
}
