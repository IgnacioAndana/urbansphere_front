import api from '../api'
import type { CrearProyectoImagenDto, ProyectoImagen } from '../../types/proyectos'

export const imagenesProyectoService = {
  async listar(proyectoId: number): Promise<ProyectoImagen[]> {
    const { data } = await api.get<ProyectoImagen[]>(`/proyectos/${proyectoId}/imagenes`)
    return data
  },

  async crearPorUrl(proyectoId: number, dto: CrearProyectoImagenDto): Promise<ProyectoImagen> {
    const { data } = await api.post<ProyectoImagen>(`/proyectos/${proyectoId}/imagenes`, dto)
    return data
  },

  async subirArchivo(
    proyectoId: number,
    archivo: File,
    opts?: { esPortada?: boolean; esPanoramica360?: boolean; etiqueta?: string; orden?: number },
  ): Promise<ProyectoImagen> {
    const form = new FormData()
    form.append('archivo', archivo)
    if (opts?.esPortada) form.append('esPortada', 'true')
    if (opts?.esPanoramica360) form.append('esPanoramica360', 'true')
    if (opts?.etiqueta) form.append('etiqueta', opts.etiqueta)
    if (opts?.orden != null) form.append('orden', String(opts.orden))

    const { data } = await api.post<ProyectoImagen>(`/proyectos/${proyectoId}/imagenes`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async actualizar(
    proyectoId: number,
    imagenId: number,
    dto: Partial<CrearProyectoImagenDto>,
  ): Promise<ProyectoImagen> {
    const { data } = await api.patch<ProyectoImagen>(
      `/proyectos/${proyectoId}/imagenes/${imagenId}`,
      dto,
    )
    return data
  },

  async eliminar(proyectoId: number, imagenId: number): Promise<void> {
    await api.delete(`/proyectos/${proyectoId}/imagenes/${imagenId}`)
  },
}
