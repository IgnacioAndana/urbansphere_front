import api from '../api';
import type { ConsultarCatalogoResponse, CrearProyectoDto, Proyecto, ProyectoCatalogoApiItem } from '../../types/proyectos';
import { normalizarTipoProyecto, type ProyectoCatalogoItem } from '../../utils/catalogoProyecto';
import { aEnteroPositivo } from '../../utils/numeros';

function normalizarItemCatalogo(item: ProyectoCatalogoApiItem): ProyectoCatalogoItem {
  return {
    ...item,
    id: aEnteroPositivo(item.id),
    tipo: normalizarTipoProyecto(item.tipo),
  };
}

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

  /** POST /proyectos/catalogo — Ficha resumida batch por IDs */
  async consultarCatalogo(ids: number[]): Promise<ConsultarCatalogoResponse> {
    const idsUnicos = [...new Set(ids.map((id) => aEnteroPositivo(id)))];
    if (idsUnicos.length === 0) {
      return { items: [], omitidos: [] };
    }
    const { data } = await api.post<ConsultarCatalogoResponse>('/proyectos/catalogo', {
      ids: idsUnicos,
    });
    return {
      items: (data.items ?? []).map(normalizarItemCatalogo),
      omitidos: (data.omitidos ?? []).map((o) => ({
        id: aEnteroPositivo(o.id),
        motivo: o.motivo,
      })),
    };
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
