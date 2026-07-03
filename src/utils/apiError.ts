import axios, { type AxiosError } from 'axios'
import type { ApiErrorExtendido } from '../services/api'
import type { ApiErrorBody } from '../types/usuarios'

const MENSAJE_LOGIN_401 =
  'Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente.'

const MENSAJE_SESION_EXPIRADA =
  'Tu sesión expiró. Inicia sesión nuevamente para continuar.'

const MENSAJES_POR_STATUS: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  500: 'Error interno del servidor. Intenta más tarde.',
  503: 'El servicio no está disponible. Intenta más tarde.',
}

function normalizarData(data: unknown): unknown {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }
  return data
}

/** Recorre la respuesta anidada del BFF (mensaje → mensaje → message) */
function buscarMensajeTexto(valor: unknown, profundidad = 0): string | undefined {
  if (profundidad > 8) return undefined

  if (typeof valor === 'string') {
    const texto = valor.trim()
    return texto.length > 0 ? texto : undefined
  }

  if (!valor || typeof valor !== 'object') return undefined

  const body = valor as ApiErrorBody
  const claves: (keyof ApiErrorBody)[] = ['message', 'mensaje', 'error']

  for (const clave of claves) {
    const contenido = body[clave]
    if (typeof contenido === 'string') {
      const texto = contenido.trim()
      if (texto && clave !== 'error') return texto
      if (texto && clave === 'error' && !body.message && !body.mensaje) return texto
    }
    if (typeof contenido === 'object' && contenido !== null) {
      const anidado = buscarMensajeTexto(contenido, profundidad + 1)
      if (anidado) return anidado
    }
  }

  return undefined
}

function esError401Login(error: AxiosError): boolean {
  const url = error.config?.url ?? ''
  return url.includes('/autenticacion/iniciar-sesion')
}

function esSesionExpirada(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  if ((error as ApiErrorExtendido).sesionExpirada) return true
  if (error.response?.status !== 401) return false
  return !esError401Login(error)
}

function mensaje401(error: AxiosError): string {
  if (esError401Login(error)) return MENSAJE_LOGIN_401
  return MENSAJE_SESION_EXPIRADA
}

/** Obtiene un mensaje legible desde la respuesta de error del BFF/NestJS */
export function obtenerMensajeError(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
    }

    const status = error.response.status
    const data = normalizarData(error.response.data)
    const extraido = buscarMensajeTexto(data)

    if (status === 401) {
      return mensaje401(error)
    }

    if (extraido) return extraido

    if (status in MENSAJES_POR_STATUS) return MENSAJES_POR_STATUS[status]
  }

  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

/** Mensajes pensados para el formulario de login (LoginView.vue) */
export function obtenerMensajeErrorLogin(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
    }

    const status = error.response?.status

    if (status === 401) {
      return MENSAJE_LOGIN_401
    }

    if (status && status >= 500) {
      return MENSAJES_POR_STATUS[503]
    }
  }

  return obtenerMensajeError(error, 'No se pudo iniciar sesión. Intenta nuevamente.')
}

export { MENSAJE_SESION_EXPIRADA, esSesionExpirada }
