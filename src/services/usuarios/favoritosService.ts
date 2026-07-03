import api from '../api'
import { aEnteroPositivo, normalizarIdsNumericos } from '../../utils/numeros'

export const favoritosService = {
  async obtenerIdsFavoritos(): Promise<number[]> {
    const { data } = await api.get<{ proyectoIds: unknown[] }>('/favoritos/ids')
    return normalizarIdsNumericos(data.proyectoIds ?? [])
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

  async obtenerFavoritos(): Promise<unknown[]> {
    const { data } = await api.get<unknown[]>('/favoritos')
    return data
  },
}
