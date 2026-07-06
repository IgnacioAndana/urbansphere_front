import type { Proyecto, ProyectoImagen, Tipologia, TipoProyecto } from '../types/proyectos'
import { ordenarImagenes } from './imagenesGaleria'

export interface ProyectoCatalogoItem {
  id: number
  titulo: string
  tipo: TipoProyecto
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
    id: Number(proyecto.id),
    titulo: proyecto.titulo,
    tipo: normalizarTipoProyecto(proyecto.tipo),
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

/** Convierte UF a pesos chilenos con el valor UF del día. */
export function clpDesdeUf(uf: number | null, valorUf: number | null): number | null {
  if (uf == null || valorUf == null || valorUf <= 0) return null
  return Math.round(uf * valorUf)
}

export function ufDesdeClp(clp: number, valorUf: number): number | null {
  if (!Number.isFinite(clp) || clp <= 0 || valorUf <= 0) return null
  return clp / valorUf
}

export function formatearPrecioClp(clp: number | null, opciones?: { aproximado?: boolean }): string {
  if (clp == null) return ''
  const prefijo = opciones?.aproximado !== false ? '≈ ' : ''
  return `${prefijo}$${clp.toLocaleString('es-CL')}`
}

export function normalizarTipoProyecto(valor: unknown): TipoProyecto {
  const t = String(valor ?? '').toLowerCase()
  return t === 'casa' ? 'casa' : 'departamento'
}

export function formatearTipoProyecto(tipo: TipoProyecto): string {
  return tipo === 'casa' ? 'Casa' : 'Departamento'
}

export function extraerComunas(proyectos: ProyectoCatalogoItem[]): string[] {
  return [...new Set(proyectos.map((p) => p.comuna).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )
}

function extraerValoresRango(
  proyectos: ProyectoCatalogoItem[],
  minKey: 'dormitoriosMin' | 'banosMin',
  maxKey: 'dormitoriosMax' | 'banosMax',
): number[] {
  const valores = new Set<number>()
  for (const p of proyectos) {
    const min = p[minKey]
    const max = p[maxKey]
    if (min == null || max == null) continue
    for (let i = min; i <= max; i++) valores.add(i)
  }
  return [...valores].sort((a, b) => a - b)
}

export function extraerDormitorios(proyectos: ProyectoCatalogoItem[]): number[] {
  return extraerValoresRango(proyectos, 'dormitoriosMin', 'dormitoriosMax')
}

export function extraerBanos(proyectos: ProyectoCatalogoItem[]): number[] {
  return extraerValoresRango(proyectos, 'banosMin', 'banosMax')
}

function coincideRango(
  min: number | null,
  max: number | null,
  valor: number | null | undefined,
): boolean {
  if (valor == null || Number.isNaN(valor)) return true
  if (min == null || max == null) return false
  return valor >= min && valor <= max
}

export function filtrarProyectosCatalogo(
  proyectos: ProyectoCatalogoItem[],
  opts: {
    texto?: string
    comuna?: string
    tipo?: string
    precioMin?: number | null
    precioMax?: number | null
    dormitorios?: number | null
    banos?: number | null
  },
): ProyectoCatalogoItem[] {
  const q = (opts.texto ?? '').trim().toLowerCase()
  return proyectos.filter((p) => {
    if (opts.tipo && opts.tipo !== 'Todos' && p.tipo !== opts.tipo) return false
    if (opts.comuna && opts.comuna !== 'Todas' && p.comuna !== opts.comuna) return false
    if (!coincideRango(p.dormitoriosMin, p.dormitoriosMax, opts.dormitorios)) return false
    if (!coincideRango(p.banosMin, p.banosMax, opts.banos)) return false
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
