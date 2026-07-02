import api from '../api';
import type { CrearTipologiaDto, Tipologia } from '../../types/proyectos';

export const tipologiasService = {
  /** POST /proyectos/:proyectoId/tipologias — Crear tipología para un proyecto */
  async crear(proyectoId: number, dto: CrearTipologiaDto): Promise<Tipologia> {
    const { data } = await api.post<Tipologia>(`/proyectos/${proyectoId}/tipologias`, dto);
    return data;
  },

  /** GET /proyectos/:proyectoId/tipologias — Listar tipologías de un proyecto */
  async listar(proyectoId: number): Promise<Tipologia[]> {
    const { data } = await api.get<Tipologia[]>(`/proyectos/${proyectoId}/tipologias`);
    return data;
  },

  /** GET /proyectos/:proyectoId/tipologias/:id — Obtener tipología */
  async obtenerPorId(proyectoId: number, id: number): Promise<Tipologia> {
    const { data } = await api.get<Tipologia>(`/proyectos/${proyectoId}/tipologias/${id}`);
    return data;
  },

  /** PATCH /proyectos/:proyectoId/tipologias/:id — Actualizar tipología */
  async actualizar(proyectoId: number, id: number, dto: Partial<CrearTipologiaDto>): Promise<Tipologia> {
    const { data } = await api.patch<Tipologia>(`/proyectos/${proyectoId}/tipologias/${id}`, dto);
    return data;
  },

  /** DELETE /proyectos/:proyectoId/tipologias/:id — Eliminar tipología */
  async eliminar(proyectoId: number, id: number): Promise<void> {
    await api.delete(`/proyectos/${proyectoId}/tipologias/${id}`);
  }
};
