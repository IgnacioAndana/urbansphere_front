import api from '../api'
import type { ActualizarEquipamientoDto, Equipamiento } from '../../types/proyectos'

export const equipamientoService = {
  async obtener(proyectoId: number): Promise<Equipamiento> {
    const { data } = await api.get<Equipamiento>(`/proyectos/${proyectoId}/equipamiento`)
    return data
  },

  async guardar(proyectoId: number, dto: ActualizarEquipamientoDto): Promise<Equipamiento> {
    const { data } = await api.put<Equipamiento>(`/proyectos/${proyectoId}/equipamiento`, dto)
    return data
  },
}
