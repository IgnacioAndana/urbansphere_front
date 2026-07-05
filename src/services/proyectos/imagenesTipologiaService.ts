import axios from 'axios'
import api, { API_PUBLICO } from '../api'
import type { TipologiaImagen } from '../../types/proyectos'
import type { ActualizarImagenDto } from '../../utils/imagenesGaleria'

function esGaleriaVacia(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404
}

export const imagenesTipologiaService = {
  async listar(
    proyectoId: number,
    tipologiaId: number,
    opciones?: { publico?: boolean },
  ): Promise<TipologiaImagen[]> {
    const config = opciones?.publico ? API_PUBLICO : undefined
    try {
      const { data } = await api.get<TipologiaImagen[]>(
        `/proyectos/${proyectoId}/tipologias/${tipologiaId}/imagenes`,
        config,
      )
      return Array.isArray(data) ? data : []
    } catch (error) {
      if (esGaleriaVacia(error)) return []
      throw error
    }
  },

  async subirArchivo(
    proyectoId: number,
    tipologiaId: number,
    archivo: File,
    opts?: { orden?: number },
  ): Promise<TipologiaImagen> {
    const form = new FormData()
    form.append('archivo', archivo)
    if (opts?.orden != null) form.append('orden', String(opts.orden))

    const { data } = await api.post<TipologiaImagen>(
      `/proyectos/${proyectoId}/tipologias/${tipologiaId}/imagenes`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  async actualizar(
    proyectoId: number,
    tipologiaId: number,
    imagenId: number,
    dto: ActualizarImagenDto,
  ): Promise<TipologiaImagen> {
    const { data } = await api.patch<TipologiaImagen>(
      `/proyectos/${proyectoId}/tipologias/${tipologiaId}/imagenes/${imagenId}`,
      dto,
    )
    return data
  },

  async eliminar(proyectoId: number, tipologiaId: number, imagenId: number): Promise<void> {
    await api.delete(`/proyectos/${proyectoId}/tipologias/${tipologiaId}/imagenes/${imagenId}`)
  },
}
