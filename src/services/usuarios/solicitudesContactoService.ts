import api from '../api'
import type { SolicitudContacto, SolicitudContactoDto } from '../../types/usuarios'

export const solicitudesContactoService = {
  async enviar(dto: SolicitudContactoDto): Promise<SolicitudContacto> {
    const { data } = await api.post<SolicitudContacto>('/solicitudes-contacto', dto)
    return data
  },
}
