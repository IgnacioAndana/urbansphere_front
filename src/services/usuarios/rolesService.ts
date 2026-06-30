/**
 * MS Usuarios — Roles
 *
 * Endpoint:
 * | Método | Ruta    | Auth | Componente(s)              |
 * |--------|---------|------|----------------------------|
 * | GET    | /roles  | JWT  | (vista admin usuarios)     |
 *
 * Tabla BD: roles — admin, user, agent (seed en init-all.sql)
 * Relación: rol_permisos (N:M con permisos)
 */
import api from '../api'
import type { Rol } from '../../types/usuarios'

export const rolesService = {
  /** GET /roles */
  async listar(): Promise<Rol[]> {
    const { data } = await api.get<Rol[]>('/roles')
    return data
  },
}
