export interface CrearProyectoDto {
  titulo: string
  direccion: string
  comuna: string
  fechaEntregaEstimada?: string
  latitud: number
  longitud: number
  descripcion: string
  estado: string
}

export interface Proyecto {
  id: number
  titulo: string
  slug: string
  direccion: string
  comuna: string
  fechaEntregaEstimada: string
  latitud: number
  longitud: number
  descripcion: string
  estado: string
}

export interface CrearTipologiaDto {
  codigoTipologia: string
  dormitorios: number
  banos: number
  superficieM2: number
  valorEnUf: number
}

export interface Tipologia extends CrearTipologiaDto {
  id: number
  proyectoId: number
}

export interface ProyectoImagen {
  id: number
  proyectoId: number
  urlS3: string
  etiqueta?: string
  esPortada: boolean
  orden: number
}

export interface CrearProyectoImagenDto {
  urlS3?: string
  etiqueta?: string
  esPortada?: boolean
  orden?: number
}

export interface TipologiaImagen {
  id: number
  tipologiaId: number
  urlS3: string
  esPortada: boolean
  orden: number
}

export interface Equipamiento {
  proyectoId: number
  gimnasio: boolean
  quincho: boolean
  areasVerdes: boolean
  bicicletero: boolean
  piscina: boolean
  juegosInfantiles: boolean
  gourmetLounge: boolean
  coworkingRoom: boolean
}

export type ActualizarEquipamientoDto = Omit<Equipamiento, 'proyectoId'>

export const EQUIPAMIENTO_OPCIONES: { key: keyof ActualizarEquipamientoDto; label: string }[] = [
  { key: 'gimnasio', label: 'Gimnasio' },
  { key: 'piscina', label: 'Piscina' },
  { key: 'quincho', label: 'Quincho' },
  { key: 'areasVerdes', label: 'Áreas verdes' },
  { key: 'bicicletero', label: 'Bicicletero' },
  { key: 'juegosInfantiles', label: 'Juegos infantiles' },
  { key: 'gourmetLounge', label: 'Salón gourmet' },
  { key: 'coworkingRoom', label: 'Coworking' },
]
