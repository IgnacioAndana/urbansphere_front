import axios from 'axios'
import api, { API_PUBLICO } from '../api'
import { proyectosService } from './index'
import { favoritosService } from '../usuarios'
import type { Equipamiento, Proyecto, ProyectoImagen, Tipologia } from '../../types/proyectos'
import { mapProyectoCatalogo, type ProyectoCatalogoItem } from '../../utils/catalogoProyecto'

export interface ProyectoDetallePublico {
  proyecto: Proyecto
  tipologias: Tipologia[]
  imagenes: ProyectoImagen[]
  equipamiento: Equipamiento | null
  catalogo: ProyectoCatalogoItem
}

function mapearDetalleAgregado(
  agregado: Awaited<ReturnType<typeof proyectosService.obtenerDetalleCatalogoPublico>>,
): ProyectoDetallePublico {
  return {
    proyecto: agregado.proyecto,
    tipologias: agregado.tipologias ?? [],
    imagenes: agregado.imagenes ?? [],
    equipamiento: agregado.equipamiento ?? null,
    catalogo: mapProyectoCatalogo(
      agregado.proyecto,
      agregado.tipologias ?? [],
      agregado.imagenes ?? [],
    ),
  }
}

async function listarTipologiasPublicas(id: number): Promise<Tipologia[]> {
  try {
    const { data } = await api.get<Tipologia[]>(`/proyectos/${id}/tipologias`, API_PUBLICO)
    return data ?? []
  } catch {
    return []
  }
}

async function listarImagenesPublicas(id: number): Promise<ProyectoImagen[]> {
  try {
    const { data } = await api.get<ProyectoImagen[]>(`/proyectos/${id}/imagenes`, API_PUBLICO)
    return Array.isArray(data) ? data : []
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return []
    return []
  }
}

async function obtenerEquipamientoPublico(id: number): Promise<Equipamiento | null> {
  try {
    const { data } = await api.get<Equipamiento>(`/proyectos/${id}/equipamiento`, API_PUBLICO)
    return data ?? null
  } catch {
    return null
  }
}

async function obtenerDetallePorRecursosPublicos(id: number): Promise<ProyectoDetallePublico | null> {
  const proyecto = await proyectosService.obtenerPorIdPublico(id)
  if (proyecto.estado !== 'activo') return null

  const [tipologias, imagenes, equipamiento] = await Promise.all([
    listarTipologiasPublicas(id),
    listarImagenesPublicas(id),
    obtenerEquipamientoPublico(id),
  ])

  return {
    proyecto,
    tipologias,
    imagenes,
    equipamiento,
    catalogo: mapProyectoCatalogo(proyecto, tipologias, imagenes),
  }
}

export const catalogoService = {
  /** Cache en memoria para no repetir peticiones al volver al catálogo en la misma sesión. */
  _cacheActivos: null as { data: ProyectoCatalogoItem[]; ts: number } | null,
  _cacheTtlMs: 5 * 60 * 1000,

  invalidarCacheActivos() {
    this._cacheActivos = null
  },

  async listarActivos(opciones?: { forzarRecarga?: boolean }): Promise<ProyectoCatalogoItem[]> {
    const cache = this._cacheActivos
    if (
      !opciones?.forzarRecarga &&
      cache &&
      Date.now() - cache.ts < this._cacheTtlMs
    ) {
      return cache.data
    }

    try {
      const items = await proyectosService.listarCatalogoActivosPublico()
      this._cacheActivos = { data: items, ts: Date.now() }
      return items
    } catch {
      /* fallback: GET /proyectos + POST /proyectos/catalogo sin JWT */
    }

    const proyectos = await proyectosService.listarPublico()
    const ids = proyectos.map((p) => p.id)

    if (!ids.length) {
      this._cacheActivos = { data: [], ts: Date.now() }
      return []
    }

    const { items } = await proyectosService.consultarCatalogoPublico(ids)
    this._cacheActivos = { data: items, ts: Date.now() }
    return items
  },

  /** Favoritos del usuario autenticado, ordenados por fecha de agregado (MS Usuarios + batch catálogo). */
  async listarFavoritosUsuario(): Promise<ProyectoCatalogoItem[]> {
    const { favoritos, proyectoIds } = await favoritosService.listar()
    if (!proyectoIds.length) return []

    const { items } = await proyectosService.consultarCatalogo(proyectoIds)
    const porId = new Map(items.map((p) => [p.id, p]))

    return favoritos
      .map((f) => porId.get(f.proyectoId))
      .filter((p): p is ProyectoCatalogoItem => p != null)
  },

  async obtenerDetalle(id: number): Promise<ProyectoDetallePublico | null> {
    try {
      const agregado = await proyectosService.obtenerDetalleCatalogoPublico(id)
      if (agregado.proyecto.estado !== 'activo') return null
      return mapearDetalleAgregado(agregado)
    } catch {
      try {
        return await obtenerDetallePorRecursosPublicos(id)
      } catch {
        return null
      }
    }
  },
}
