/**
 * MS Usuarios — Permisos
 *
 * Endpoint:
 * | Método | Ruta       | Auth | Componente(s)              |
 * |--------|------------|------|----------------------------|
 * | GET    | /permisos  | JWT  | (vista admin usuarios)     |
 *
 * Tabla BD: permisos — users.read, users.write, projects.read, etc.
 * Asignados a roles vía rol_permisos (admin tiene todos).
 */
import api from '../api'
import type { Permiso } from '../../types/usuarios'

export const permisosService = {
  /** GET /permisos */
  async listar(): Promise<Permiso[]> {
    const { data } = await api.get<Permiso[]>('/permisos')
    return data
  },
}
