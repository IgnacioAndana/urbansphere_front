const DEFAULT_API_BASE_URL = 'http://13.222.88.101/api'

/** URL base del BFF (nginx). Todas las rutas de servicios se concatenan a esto. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL

/** API Key de Google Gemini (opcional). Solo para redactar descripciones en el admin. */
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim() || ''

/** Modelo Gemini para generateContent. gemini-1.5-flash fue retirado; usar 2.5+ */
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'
export const GEMINI_MODEL =
  import.meta.env.VITE_GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL

export function tieneGeminiConfigurada(): boolean {
  return GEMINI_API_KEY.length > 0
}

/** Tamaño máximo de imágenes en subidas (debe alinearse con nginx/BFF). */
const DEFAULT_MAX_IMAGEN_MB = 10
export const MAX_IMAGEN_MB = (() => {
  const raw = import.meta.env.VITE_MAX_IMAGEN_MB
  if (raw == null || String(raw).trim() === '') return DEFAULT_MAX_IMAGEN_MB
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_IMAGEN_MB
})()
export const MAX_IMAGEN_BYTES = MAX_IMAGEN_MB * 1024 * 1024
