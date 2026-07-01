import axios from 'axios'
import { API_BASE_URL } from '../config/env'

export const STORAGE_KEYS = {
  tokenAcceso: 'urbansphere_token',
  tokenRefresco: 'urbansphere_refresh_token',
  usuario: 'urbansphere_usuario',
} as const

const RUTAS_PUBLICAS_POST = [
  '/autenticacion/iniciar-sesion',
  '/autenticacion/refrescar',
  '/autenticacion/cerrar-sesion',
  '/autenticacion/solicitar-restablecimiento',
  '/autenticacion/validar-token-restablecimiento',
  '/autenticacion/restablecer-contrasena',
]

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const metodo = config.method?.toLowerCase()
  const esPostPublico =
    metodo === 'post' &&
    RUTAS_PUBLICAS_POST.some((ruta) => config.url === ruta || config.url?.endsWith(ruta))

  /** Registro público sin JWT; con JWT el admin crea usuarios */
  const esRegistroPublico =
    metodo === 'post' &&
    config.url === '/usuarios' &&
    !localStorage.getItem(STORAGE_KEYS.tokenAcceso)

  const token = localStorage.getItem(STORAGE_KEYS.tokenAcceso)
  if (token && config.headers && !esPostPublico && !esRegistroPublico) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const teniaSesion = Boolean(localStorage.getItem(STORAGE_KEYS.tokenAcceso))
      const rutasPublicas = ['/login', '/olvide-contrasena', '/restablecer-contrasena']
      const enRutaPublica = rutasPublicas.some((r) => window.location.pathname.startsWith(r))

      if (teniaSesion && !enRutaPublica) {
        localStorage.removeItem(STORAGE_KEYS.tokenAcceso)
        localStorage.removeItem(STORAGE_KEYS.tokenRefresco)
        localStorage.removeItem(STORAGE_KEYS.usuario)
        window.location.href = '/login'
      }
    } else if (error.response) {
      console.error(`[API Error ${error.response.status}]:`, error.response.data);
    } else {
      console.error('[Network Error]: No se pudo conectar con el servidor backend.');
    }
    return Promise.reject(error)
  },
)

export default api
