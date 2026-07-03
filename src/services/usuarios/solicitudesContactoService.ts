import api from '../api'
import type {
  EstadoSolicitud,
  GestionSolicitudDto,
  SolicitudContacto,
  SolicitudContactoDto,
} from '../../types/usuarios'
import { aEnteroPositivo } from '../../utils/numeros'

export const solicitudesContactoService = {
  /** POST /solicitudes-contacto — Público */
  async enviar(dto: SolicitudContactoDto): Promise<SolicitudContacto> {
    const { data } = await api.post<SolicitudContacto>('/solicitudes-contacto', dto)
    return data
  },

  /** GET /solicitudes-contacto?estado= — Panel admin/agent */
  async listar(estado?: EstadoSolicitud): Promise<SolicitudContacto[]> {
    const params = estado ? { estado } : undefined
    const { data } = await api.get<SolicitudContacto[]>('/solicitudes-contacto', { params })
    return Array.isArray(data) ? data : []
  },

  /** PATCH /solicitudes-contacto/:id/gestion */
  async gestionar(id: number, dto: GestionSolicitudDto): Promise<SolicitudContacto> {
    const { data } = await api.patch<SolicitudContacto>(
      `/solicitudes-contacto/${aEnteroPositivo(id)}/gestion`,
      dto,
    )
    return data
  },
}
