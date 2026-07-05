import axios, { type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../config/env'
import { tokenJwtExpirado } from '../utils/jwt'

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

export type RequestConfigExtendida = InternalAxiosRequestConfig & {
  _retry?: boolean
  /** No envía JWT — catálogo y detalle público aunque haya token expirado en localStorage */
  skipAuth?: boolean
}

/** Opciones Axios para endpoints públicos del catálogo */
export const API_PUBLICO = { skipAuth: true } as RequestConfigExtendida

export type ApiErrorExtendido = Error & { sesionExpirada?: boolean }

let promesaRefresco: Promise<string | null> | null = null

function esRutaAuthPublica(url: string | undefined, method: string | undefined): boolean {
  if (!url) return false
  const metodo = method?.toLowerCase()
  return (
    metodo === 'post' &&
    RUTAS_PUBLICAS_POST.some((ruta) => url === ruta || url.endsWith(ruta))
  )
}

function esRegistroPublico(url: string | undefined, method: string | undefined): boolean {
  return (
    method?.toLowerCase() === 'post' &&
    url === '/usuarios' &&
    !localStorage.getItem(STORAGE_KEYS.tokenAcceso)
  )
}

async function intentarRefrescarToken(): Promise<string | null> {
  const tokenRefresco = localStorage.getItem(STORAGE_KEYS.tokenRefresco)
  if (!tokenRefresco) return null

  if (!promesaRefresco) {
    promesaRefresco = axios
      .post<{ tokenAcceso: string; tokenRefresco: string }>(
        `${API_BASE_URL}/autenticacion/refrescar`,
        { tokenRefresco },
        {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          timeout: 15000,
        },
      )
      .then(({ data }) => {
        localStorage.setItem(STORAGE_KEYS.tokenAcceso, data.tokenAcceso)
        localStorage.setItem(STORAGE_KEYS.tokenRefresco, data.tokenRefresco)
        return data.tokenAcceso
      })
      .catch(() => null)
      .finally(() => {
        promesaRefresco = null
      })
  }

  return promesaRefresco
}

async function obtenerTokenValido(): Promise<string | null> {
  const token = localStorage.getItem(STORAGE_KEYS.tokenAcceso)
  if (token && !tokenJwtExpirado(token)) return token

  if (!localStorage.getItem(STORAGE_KEYS.tokenRefresco)) return token

  return intentarRefrescarToken()
}

/** Limpia la sesión local y redirige al login con aviso de expiración. */
export function expulsarSesion(returnTo?: string) {
  localStorage.removeItem(STORAGE_KEYS.tokenAcceso)
  localStorage.removeItem(STORAGE_KEYS.tokenRefresco)
  localStorage.removeItem(STORAGE_KEYS.usuario)

  const params = new URLSearchParams({ sesionExpirada: '1' })
  if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('/login')) {
    params.set('returnTo', returnTo)
  }

  const destino = `/login?${params.toString()}`
  if (window.location.pathname + window.location.search !== destino) {
    window.location.href = destino
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const cfg = config as RequestConfigExtendida

  if (cfg.skipAuth) {
    if (cfg.headers) delete cfg.headers.Authorization
    return config
  }

  if (esRutaAuthPublica(config.url, config.method) || esRegistroPublico(config.url, config.method)) {
    return config
  }

  const tokenValido = await obtenerTokenValido()
  if (tokenValido && config.headers) {
    config.headers.Authorization = `Bearer ${tokenValido}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RequestConfigExtendida | undefined
    const status = error.response?.status
    const url = originalRequest?.url ?? ''

    if (originalRequest?.skipAuth) {
      return Promise.reject(error)
    }

    if (status !== 401 || !originalRequest) {
      if (error.response) {
        console.error(`[API Error ${error.response.status}]:`, error.response.data)
      } else if (!error.response) {
        console.error('[Network Error]: No se pudo conectar con el servidor backend.')
      }
      return Promise.reject(error)
    }

    if (esRutaAuthPublica(url, originalRequest.method)) {
      return Promise.reject(error)
    }

    const teniaSesion = Boolean(
      localStorage.getItem(STORAGE_KEYS.tokenAcceso) ||
        localStorage.getItem(STORAGE_KEYS.tokenRefresco),
    )

    const marcarSesionExpirada = () => {
      ;(error as ApiErrorExtendido).sesionExpirada = true
    }

    if (url.includes('/autenticacion/refrescar') || originalRequest._retry) {
      if (teniaSesion) {
        expulsarSesion(window.location.pathname + window.location.search)
      }
      marcarSesionExpirada()
      return Promise.reject(error)
    }

    if (!teniaSesion) {
      return Promise.reject(error)
    }

    originalRequest._retry = true
    const nuevoToken = await intentarRefrescarToken()

    if (nuevoToken) {
      originalRequest.headers.Authorization = `Bearer ${nuevoToken}`
      return api(originalRequest)
    }

    expulsarSesion(window.location.pathname + window.location.search)
    marcarSesionExpirada()
    return Promise.reject(error)
  },
)

export default api
