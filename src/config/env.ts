const DEFAULT_API_BASE_URL = 'http://13.222.88.101/api'

/** URL base del BFF (nginx). Todas las rutas de servicios se concatenan a esto. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL

/** API Key de Google Gemini (opcional). Solo para redactar descripciones en el admin. */
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim() || ''

export function tieneGeminiConfigurada(): boolean {
  return GEMINI_API_KEY.length > 0
}
