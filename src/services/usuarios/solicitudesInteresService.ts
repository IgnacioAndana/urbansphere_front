import api from '../api'
import type { SolicitudInteres, SolicitudInteresDto } from '../../types/usuarios'
import { aEnteroPositivo } from '../../utils/numeros'

export const solicitudesInteresService = {
  async enviar(dto: SolicitudInteresDto): Promise<SolicitudInteres> {
    const { data } = await api.post<SolicitudInteres>('/solicitudes-interes', {
      proyectoId: aEnteroPositivo(dto.proyectoId),
      nombre: dto.nombre,
      email: dto.email,
    })
    return data
  },

  async listar(): Promise<SolicitudInteres[]> {
    const { data } = await api.get<SolicitudInteres[]>('/solicitudes-interes')
    return data
  },

  async listarPorProyecto(proyectoId: number): Promise<SolicitudInteres[]> {
    const id = aEnteroPositivo(proyectoId)
    const { data } = await api.get<SolicitudInteres[]>(`/solicitudes-interes/proyecto/${id}`)
    return data
  },
}
