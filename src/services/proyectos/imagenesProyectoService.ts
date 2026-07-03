import axios from 'axios'
import api from '../api'
import type { CrearProyectoImagenDto, ProyectoImagen } from '../../types/proyectos'
import type { ActualizarImagenDto } from '../../utils/imagenesGaleria'

function esGaleriaVacia(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404
}

export const imagenesProyectoService = {
  async listar(proyectoId: number): Promise<ProyectoImagen[]> {
    try {
      const { data } = await api.get<ProyectoImagen[]>(`/proyectos/${proyectoId}/imagenes`)
      return Array.isArray(data) ? data : []
    } catch (error) {
      if (esGaleriaVacia(error)) return []
      throw error
    }
  },

  async crearPorUrl(proyectoId: number, dto: CrearProyectoImagenDto): Promise<ProyectoImagen> {
    const { data } = await api.post<ProyectoImagen>(`/proyectos/${proyectoId}/imagenes`, dto)
    return data
  },

  /**
   * Sube imagen a S3. No envía esPortada: el MS asigna portada a la primera imagen
   * y al marcar otra vía PATCH desmarca la anterior.
   */
  async subirArchivo(
    proyectoId: number,
    archivo: File,
    opts?: { etiqueta?: string; orden?: number },
  ): Promise<ProyectoImagen> {
    const form = new FormData()
    form.append('archivo', archivo)
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
    dto: ActualizarImagenDto,
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
