/** Ordena imágenes por `orden` (más antigua primero); respaldo por `id`. */
export function ordenarImagenes<T extends { orden?: number; id: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const oa = a.orden ?? a.id
    const ob = b.orden ?? b.id
    return oa - ob
  })
}

export interface ActualizarImagenDto {
  esPortada?: boolean
  etiqueta?: string
  orden?: number
}
