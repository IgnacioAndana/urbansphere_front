import type { Router } from 'vue-router'
import { authService } from '../services/usuarios'
import { esUsuarioEstandar, puedeAccederPanelAdmin } from '../constants/roles'

/** Ruta destino tras login según rol_id (admin=1, user=2, agent=3) */
export function rutaPostLogin(): string {
  const rolId = authService.obtenerRolIdLocal()
  if (esUsuarioEstandar(rolId)) return '/'
  if (puedeAccederPanelAdmin(rolId)) return '/admin/nuevo-proyecto'
  return '/'
}

export async function redirigirTrasLogin(router: Router): Promise<void> {
  await authService.obtenerPerfil()
  await router.push(rutaPostLogin())
}

export function rutaSiYaAutenticado(): string | null {
  if (!authService.estaAutenticado()) return null
  return rutaPostLogin()
}
