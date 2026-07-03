import api from '../api'
import type {
  EstadoSolicitud,
  GestionSolicitudDto,
  SolicitudContacto,
  SolicitudContactoDto,
} from '../../types/usuarios'
import { aEnteroPositivo } from '../../utils/numeros'
import { normalizarSolicitudContacto } from '../../utils/normalizarSolicitud'

export const solicitudesContactoService = {
  /** POST /solicitudes-contacto — Público */
  async enviar(dto: SolicitudContactoDto): Promise<SolicitudContacto> {
    const { data } = await api.post<SolicitudContacto>('/solicitudes-contacto', dto)
    return data
  },

  /** GET /solicitudes-contacto?estado= — Panel admin/agent */
  async listar(estado?: EstadoSolicitud): Promise<SolicitudContacto[]> {
    const params = estado ? { estado } : undefined
    const { data } = await api.get<unknown[]>('/solicitudes-contacto', { params })
    if (!Array.isArray(data)) return []
    return data.map(normalizarSolicitudContacto).filter((s): s is SolicitudContacto => s != null)
  },

  /** PATCH /solicitudes-contacto/:id/gestion — irreversible a resuelta */
  async gestionar(id: number, dto: GestionSolicitudDto): Promise<SolicitudContacto> {
    const { data } = await api.patch<unknown>(
      `/solicitudes-contacto/${aEnteroPositivo(id)}/gestion`,
      dto,
    )
    return normalizarSolicitudContacto(data)!
  },
}
