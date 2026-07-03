import type { Proyecto, ProyectoImagen, Tipologia } from '../types/proyectos'
import { ordenarImagenes } from './imagenesGaleria'

export interface ProyectoCatalogoItem {
  id: number
  titulo: string
  comuna: string
  direccion: string
  latitud: number
  longitud: number
  descripcion: string
  fechaEntregaEstimada?: string
  urlPortada: string | null
  precioDesdeUf: number | null
  dormitoriosMin: number | null
  dormitoriosMax: number | null
  banosMin: number | null
  banosMax: number | null
  superficieMin: number | null
  superficieMax: number | null
}

export function obtenerUrlPortada(imagenes: ProyectoImagen[]): string | null {
  const ordenadas = ordenarImagenes(imagenes)
  const portada = ordenadas.find((img) => img.esPortada) ?? ordenadas[0]
  return portada?.urlS3 ?? null
}

function rangoNumerico(valores: number[]): { min: number | null; max: number | null } {
  if (valores.length === 0) return { min: null, max: null }
  return { min: Math.min(...valores), max: Math.max(...valores) }
}

export function mapProyectoCatalogo(
  proyecto: Proyecto,
  tipologias: Tipologia[],
  imagenes: ProyectoImagen[],
): ProyectoCatalogoItem {
  const ufs = tipologias.map((t) => t.valorEnUf).filter((v) => v > 0)
  const dorms = tipologias.map((t) => t.dormitorios)
  const banos = tipologias.map((t) => t.banos)
  const m2 = tipologias.map((t) => t.superficieM2)

  const rangoDorms = rangoNumerico(dorms)
  const rangoBanos = rangoNumerico(banos)
  const rangoM2 = rangoNumerico(m2)

  return {
    id: proyecto.id,
    titulo: proyecto.titulo,
    comuna: proyecto.comuna,
    direccion: proyecto.direccion,
    latitud: proyecto.latitud,
    longitud: proyecto.longitud,
    descripcion: proyecto.descripcion,
    fechaEntregaEstimada: proyecto.fechaEntregaEstimada,
    urlPortada: obtenerUrlPortada(imagenes),
    precioDesdeUf: ufs.length ? Math.min(...ufs) : null,
    dormitoriosMin: rangoDorms.min,
    dormitoriosMax: rangoDorms.max,
    banosMin: rangoBanos.min,
    banosMax: rangoBanos.max,
    superficieMin: rangoM2.min,
    superficieMax: rangoM2.max,
  }
}

export function formatearRango(min: number | null, max: number | null, sufijo = ''): string {
  if (min == null || max == null) return '—'
  if (min === max) return `${min}${sufijo}`
  return `${min} - ${max}${sufijo}`
}

export function formatearPrecioUf(uf: number | null): string {
  if (uf == null) return 'Consultar'
  return `UF ${uf.toLocaleString('es-CL')}`
}

export function extraerComunas(proyectos: ProyectoCatalogoItem[]): string[] {
  return [...new Set(proyectos.map((p) => p.comuna).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )
}

export function filtrarProyectosCatalogo(
  proyectos: ProyectoCatalogoItem[],
  opts: {
    texto?: string
    comuna?: string
    precioMin?: number | null
    precioMax?: number | null
  },
): ProyectoCatalogoItem[] {
  const q = (opts.texto ?? '').trim().toLowerCase()
  return proyectos.filter((p) => {
    if (opts.comuna && opts.comuna !== 'Todas' && p.comuna !== opts.comuna) return false
    if (opts.precioMin != null && p.precioDesdeUf != null && p.precioDesdeUf < opts.precioMin) {
      return false
    }
    if (opts.precioMax != null && p.precioDesdeUf != null && p.precioDesdeUf > opts.precioMax) {
      return false
    }
    if (!q) return true
    return (
      p.titulo.toLowerCase().includes(q) ||
      p.comuna.toLowerCase().includes(q) ||
      p.direccion.toLowerCase().includes(q)
    )
  })
}

export function mensajeInteresDefault(tituloProyecto: string): string {
  return `Hola, me gustaría recibir más información sobre el proyecto "${tituloProyecto}".`
}
