import { MAX_IMAGEN_BYTES, MAX_IMAGEN_MB } from '../config/env'
import { obtenerMensajeError } from './apiError'

export function formatearTamanoArchivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Devuelve mensaje de error o null si el archivo es válido. */
export function validarArchivoImagen(archivo: File): string | null {
  if (!archivo.type.startsWith('image/')) {
    return 'Solo se permiten archivos de imagen (JPG, PNG, WebP, etc.).'
  }
  if (archivo.size === 0) {
    return 'El archivo está vacío.'
  }
  if (archivo.size > MAX_IMAGEN_BYTES) {
    return `La imagen pesa ${formatearTamanoArchivo(archivo.size)} y supera el máximo de ${MAX_IMAGEN_MB} MB. Comprímela o elige otra más liviana.`
  }
  return null
}

export function textoLimiteImagen(): string {
  return `JPG, PNG o WebP · máximo ${MAX_IMAGEN_MB} MB por archivo`
}

export function obtenerMensajeErrorSubidaImagen(error: unknown): string {
  return obtenerMensajeError(
    error,
    'No se pudo subir la imagen. Intenta con un archivo más liviano.',
  )
}
