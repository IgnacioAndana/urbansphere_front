/**
 * MS Usuarios — Solicitudes de interés ("Me interesa este proyecto")
 * POST público u opcional con JWT
 */
import api from '../api'
import type { SolicitudInteres, SolicitudInteresDto } from '../../types/usuarios'

export const solicitudesInteresService = {
  async enviar(dto: SolicitudInteresDto): Promise<SolicitudInteres> {
    const { data } = await api.post<SolicitudInteres>('/solicitudes-interes', dto)
    return data
  },

  async listar(): Promise<SolicitudInteres[]> {
    const { data } = await api.get<SolicitudInteres[]>('/solicitudes-interes')
    return data
  },

  async listarPorProyecto(proyectoId: number): Promise<SolicitudInteres[]> {
    const { data } = await api.get<SolicitudInteres[]>(`/solicitudes-interes/proyecto/${proyectoId}`)
    return data
  },
}
