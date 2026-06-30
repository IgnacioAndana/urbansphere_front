import axios from 'axios'
import { API_BASE_URL } from '../config/env'

/** Claves de almacenamiento local para la sesión JWT */
export const STORAGE_KEYS = {
  tokenAcceso: 'urbansphere_token',
  tokenRefresco: 'urbansphere_refresh_token',
  usuario: 'urbansphere_usuario',
} as const

const RUTAS_PUBLICAS_POST = [
  '/autenticacion/iniciar-sesion',
  '/autenticacion/refrescar',
  '/autenticacion/cerrar-sesion',
]

/**
 * Cliente HTTP centralizado.
 * Apunta al BFF (nginx) que enruta hacia los microservicios.
 * Base URL: VITE_API_BASE_URL
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/** Inyecta el JWT de acceso en peticiones protegidas */
api.interceptors.request.use((config) => {
  const esPostPublico =
    config.method?.toLowerCase() === 'post' &&
    RUTAS_PUBLICAS_POST.some((ruta) => config.url === ruta || config.url?.endsWith(ruta))

  const esRegistro = config.method?.toLowerCase() === 'post' && config.url === '/usuarios'

  const token = localStorage.getItem(STORAGE_KEYS.tokenAcceso)
  if (token && config.headers && !esPostPublico && !esRegistro) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Manejo global de 401: limpia sesión solo si ya había token (no en intento de login) */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const teniaSesion = Boolean(localStorage.getItem(STORAGE_KEYS.tokenAcceso))
      const enLogin = window.location.pathname === '/login'

      if (teniaSesion && !enLogin) {
        localStorage.removeItem(STORAGE_KEYS.tokenAcceso)
        localStorage.removeItem(STORAGE_KEYS.tokenRefresco)
        localStorage.removeItem(STORAGE_KEYS.usuario)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
