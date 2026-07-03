import {
  proyectosService,
  tipologiasService,
  imagenesProyectoService,
  equipamientoService,
} from './index'
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

export const catalogoService = {
  /** Cache en memoria para no repetir ~20 peticiones al volver al catálogo en la misma sesión. */
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

    const proyectos = await proyectosService.listar()
    const ids = proyectos.filter((p) => p.estado === 'activo').map((p) => p.id)

    if (!ids.length) {
      this._cacheActivos = { data: [], ts: Date.now() }
      return []
    }

    const { items } = await proyectosService.consultarCatalogo(ids)
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
      const proyecto = await proyectosService.obtenerPorId(id)
      if (proyecto.estado !== 'activo') return null

      const [tipologias, imagenes, equipamiento] = await Promise.all([
        tipologiasService.listar(id).catch(() => [] as Tipologia[]),
        imagenesProyectoService.listar(id).catch(() => [] as ProyectoImagen[]),
        equipamientoService.obtener(id).catch(() => null),
      ])

      return {
        proyecto,
        tipologias,
        imagenes,
        equipamiento,
        catalogo: mapProyectoCatalogo(proyecto, tipologias, imagenes),
      }
    } catch {
      return null
    }
  },
}
