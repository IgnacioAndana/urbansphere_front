import api from '../api'
import type { ListarFavoritosResponse } from '../../types/usuarios'
import { aEnteroPositivo, normalizarIdsNumericos } from '../../utils/numeros'

export const favoritosService = {
  async listar(): Promise<ListarFavoritosResponse> {
    const { data } = await api.get<ListarFavoritosResponse>('/favoritos')
    return {
      total: data.total ?? 0,
      proyectoIds: normalizarIdsNumericos(data.proyectoIds ?? []),
      favoritos: (data.favoritos ?? []).map((f) => ({
        id: aEnteroPositivo(f.id),
        proyectoId: aEnteroPositivo(f.proyectoId),
        agregadoEn: f.agregadoEn,
      })),
    }
  },

  async obtenerIdsFavoritos(): Promise<number[]> {
    const { proyectoIds } = await this.listar()
    return proyectoIds
  },

  async esFavorito(proyectoId: number): Promise<boolean> {
    const id = aEnteroPositivo(proyectoId)
    try {
      await api.get(`/favoritos/proyecto/${id}`)
      return true
    } catch {
      return false
    }
  },

  async agregarFavorito(proyectoId: number): Promise<void> {
    await api.post('/favoritos', { proyectoId: aEnteroPositivo(proyectoId) })
  },

  async eliminarFavorito(proyectoId: number): Promise<void> {
    await api.delete(`/favoritos/${aEnteroPositivo(proyectoId)}`)
  },
}
