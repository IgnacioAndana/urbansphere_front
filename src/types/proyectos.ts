export interface CrearProyectoDto {
  titulo: string;
  direccion: string;
  comuna: string;
  fechaEntregaEstimada?: string; // YYYY-MM-DD
  latitud: number;
  longitud: number;
  descripcion: string;
  estado: string; // 'borrador' | 'activo' | 'inactivo' | 'archivado'
}

export interface Proyecto {
  id: number;
  titulo: string;
  slug: string;
  direccion: string;
  comuna: string;
  fechaEntregaEstimada: string;
  latitud: number;
  longitud: number;
  descripcion: string;
  estado: string;
  // Otros campos como imagenes, tipologias, equipamiento que pueden venir en un GET
}

export interface CrearTipologiaDto {
  codigoTipologia: string;
  dormitorios: number;
  banos: number;
  superficieM2: number;
  valorEnUf: number;
}

export interface Tipologia extends CrearTipologiaDto {
  id: number;
  proyectoId: number;
}
