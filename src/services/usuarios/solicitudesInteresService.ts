import api from '../api'
import type {
  EstadoSolicitud,
  GestionSolicitudDto,
  SolicitudInteres,
  SolicitudInteresDto,
} from '../../types/usuarios'
import { aEnteroPositivo } from '../../utils/numeros'

export const solicitudesInteresService = {
  /** POST /solicitudes-interes — JWT user; nombre/email desde la cuenta */
  async enviar(dto: SolicitudInteresDto): Promise<SolicitudInteres> {
    const { data } = await api.post<SolicitudInteres>('/solicitudes-interes', {
      proyectoId: aEnteroPositivo(dto.proyectoId),
    })
    return data
  },

  /** GET /solicitudes-interes?estado= — Panel admin/agent */
  async listar(estado?: EstadoSolicitud): Promise<SolicitudInteres[]> {
    const params = estado ? { estado } : undefined
    const { data } = await api.get<SolicitudInteres[]>('/solicitudes-interes', { params })
    return Array.isArray(data) ? data : []
  },

  async listarPorProyecto(proyectoId: number): Promise<SolicitudInteres[]> {
    const id = aEnteroPositivo(proyectoId)
    const { data } = await api.get<SolicitudInteres[]>(`/solicitudes-interes/proyecto/${id}`)
    return Array.isArray(data) ? data : []
  },

  /** PATCH /solicitudes-interes/:id/gestion */
  async gestionar(id: number, dto: GestionSolicitudDto): Promise<SolicitudInteres> {
    const { data } = await api.patch<SolicitudInteres>(
      `/solicitudes-interes/${aEnteroPositivo(id)}/gestion`,
      dto,
    )
    return data
  },
}
