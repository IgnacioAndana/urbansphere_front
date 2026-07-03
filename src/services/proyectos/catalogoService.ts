import {
  proyectosService,
  tipologiasService,
  imagenesProyectoService,
  equipamientoService,
} from './index'
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
  async listarActivos(): Promise<ProyectoCatalogoItem[]> {
    const proyectos = await proyectosService.listar()
    const activos = proyectos.filter((p) => p.estado === 'activo')

    return Promise.all(
      activos.map(async (proyecto) => {
        const [tipologias, imagenes] = await Promise.all([
          tipologiasService.listar(proyecto.id).catch(() => [] as Tipologia[]),
          imagenesProyectoService.listar(proyecto.id).catch(() => [] as ProyectoImagen[]),
        ])
        return mapProyectoCatalogo(proyecto, tipologias, imagenes)
      }),
    )
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
