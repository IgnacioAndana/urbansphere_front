import api from '../api';
import type { CrearProyectoDto, Proyecto } from '../../types/proyectos';

export const proyectosService = {
  /** POST /proyectos — Crear proyecto (requiere JWT admin/agent) */
  async crear(dto: CrearProyectoDto): Promise<Proyecto> {
    const { data } = await api.post<Proyecto>('/proyectos', dto);
    return data;
  },

  /** GET /proyectos — Listar proyectos */
  async listar(): Promise<Proyecto[]> {
    const { data } = await api.get<Proyecto[]>('/proyectos');
    return data;
  },

  /** GET /proyectos/:id — Obtener proyecto por ID */
  async obtenerPorId(id: number): Promise<Proyecto> {
    const { data } = await api.get<Proyecto>(`/proyectos/${id}`);
    return data;
  },

  /** PATCH /proyectos/:id — Actualizar proyecto */
  async actualizar(id: number, dto: Partial<CrearProyectoDto>): Promise<Proyecto> {
    const { data } = await api.patch<Proyecto>(`/proyectos/${id}`, dto);
    return data;
  },

  /** DELETE /proyectos/:id — Eliminar proyecto */
  async eliminar(id: number): Promise<void> {
    await api.delete(`/proyectos/${id}`);
  }
};
