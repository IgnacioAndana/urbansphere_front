const DEFAULT_API_BASE_URL = 'http://13.222.88.101/api'

/** URL base del BFF (nginx). Todas las rutas de servicios se concatenan a esto. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
