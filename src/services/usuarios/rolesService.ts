/**
 * MS Usuarios — Roles fijos (admin, user, agent)
 * GET /roles — JWT admin o agent
 */
import api from '../api'
import type { Rol } from '../../types/usuarios'

export const rolesService = {
  async listar(): Promise<Rol[]> {
    const { data } = await api.get<Rol[]>('/roles')
    return data
  },
}
