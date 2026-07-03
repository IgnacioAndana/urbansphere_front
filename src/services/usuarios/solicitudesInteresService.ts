import api from '../api'
import type {
  EstadoSolicitud,
  GestionSolicitudDto,
  SolicitudInteres,
  SolicitudInteresDto,
} from '../../types/usuarios'
import { aEnteroPositivo } from '../../utils/numeros'
import { normalizarSolicitudInteres } from '../../utils/normalizarSolicitud'

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
    const { data } = await api.get<unknown[]>('/solicitudes-interes', { params })
    if (!Array.isArray(data)) return []
    return data.map(normalizarSolicitudInteres).filter((s): s is SolicitudInteres => s != null)
  },

  async listarPorProyecto(proyectoId: number): Promise<SolicitudInteres[]> {
    const id = aEnteroPositivo(proyectoId)
    const { data } = await api.get<unknown[]>(`/solicitudes-interes/proyecto/${id}`)
    if (!Array.isArray(data)) return []
    return data.map(normalizarSolicitudInteres).filter((s): s is SolicitudInteres => s != null)
  },

  /** PATCH /solicitudes-interes/:id/gestion — irreversible a resuelta */
  async gestionar(id: number, dto: GestionSolicitudDto): Promise<SolicitudInteres> {
    const { data } = await api.patch<unknown>(
      `/solicitudes-interes/${aEnteroPositivo(id)}/gestion`,
      dto,
    )
    return normalizarSolicitudInteres(data)!
  },
}
