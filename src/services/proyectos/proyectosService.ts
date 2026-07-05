import api, { API_PUBLICO } from '../api';
import type {
  ConsultarCatalogoResponse,
  CrearProyectoDto,
  Proyecto,
  ProyectoCatalogoApiItem,
  ProyectoDetalleCatalogoApi,
} from '../../types/proyectos';
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

  /** GET /proyectos — Catálogo público (solo activos, sin JWT) */
  async listarPublico(): Promise<Proyecto[]> {
    const { data } = await api.get<Proyecto[]>('/proyectos', API_PUBLICO);
    return data ?? [];
  },

  /** GET /proyectos/catalogo/activos — Listado enriquecido público (si el MS lo expone) */
  async listarCatalogoActivosPublico(): Promise<ProyectoCatalogoItem[]> {
    const { data } = await api.get<ProyectoCatalogoApiItem[]>('/proyectos/catalogo/activos', API_PUBLICO);
    return (data ?? []).map(normalizarItemCatalogo);
  },

  /** GET /proyectos/catalogo/:id — Detalle agregado público (si el MS lo expone) */
  async obtenerDetalleCatalogoPublico(id: number): Promise<ProyectoDetalleCatalogoApi> {
    const { data } = await api.get<ProyectoDetalleCatalogoApi>(`/proyectos/catalogo/${id}`, API_PUBLICO);
    return data;
  },

  /** GET /proyectos/:id — Detalle base sin JWT (proyectos activos) */
  async obtenerPorIdPublico(id: number): Promise<Proyecto> {
    const { data } = await api.get<Proyecto>(`/proyectos/${id}`, API_PUBLICO);
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

  /** POST /proyectos/catalogo — Batch público (solo activos, sin JWT) */
  async consultarCatalogoPublico(ids: number[]): Promise<ConsultarCatalogoResponse> {
    const idsUnicos = [...new Set(ids.map((id) => aEnteroPositivo(id)))];
    if (idsUnicos.length === 0) {
      return { items: [], omitidos: [] };
    }
    const { data } = await api.post<ConsultarCatalogoResponse>(
      '/proyectos/catalogo',
      { ids: idsUnicos },
      API_PUBLICO,
    );
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
