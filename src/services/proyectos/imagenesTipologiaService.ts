import api from '../api'
import type { TipologiaImagen } from '../../types/proyectos'

export const imagenesTipologiaService = {
  async listar(proyectoId: number, tipologiaId: number): Promise<TipologiaImagen[]> {
    const { data } = await api.get<TipologiaImagen[]>(
      `/proyectos/${proyectoId}/tipologias/${tipologiaId}/imagenes`,
    )
    return data
  },

  async subirArchivo(
    proyectoId: number,
    tipologiaId: number,
    archivo: File,
    opts?: { esPortada?: boolean; esPanoramica360?: boolean; orden?: number },
  ): Promise<TipologiaImagen> {
    const form = new FormData()
    form.append('archivo', archivo)
    if (opts?.esPortada) form.append('esPortada', 'true')
    if (opts?.esPanoramica360) form.append('esPanoramica360', 'true')
    if (opts?.orden != null) form.append('orden', String(opts.orden))

    const { data } = await api.post<TipologiaImagen>(
      `/proyectos/${proyectoId}/tipologias/${tipologiaId}/imagenes`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  async eliminar(proyectoId: number, tipologiaId: number, imagenId: number): Promise<void> {
    await api.delete(`/proyectos/${proyectoId}/tipologias/${tipologiaId}/imagenes/${imagenId}`)
  },
}
