import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios from 'axios'
import api, { expulsarSesion, STORAGE_KEYS, API_PUBLICO } from '../api'

describe('api service', () => {
  const originalLocation = window.location
  let axiosPostSpy: any

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    
    // Mock de window.location
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '', pathname: '/', search: '' },
      writable: true,
      configurable: true
    })

    axiosPostSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: { tokenAcceso: 'new_token', tokenRefresco: 'new_refresh' } })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    })
    vi.restoreAllMocks()
  })

  describe('expulsarSesion', () => {
    it('debería limpiar localStorage y redirigir al login si está en ruta privada', () => {
      localStorage.setItem(STORAGE_KEYS.tokenAcceso, 'token')
      localStorage.setItem(STORAGE_KEYS.tokenRefresco, 'refresh')
      localStorage.setItem(STORAGE_KEYS.usuario, '{}')
      
      window.location.pathname = '/perfil'

      expulsarSesion()

      expect(localStorage.getItem(STORAGE_KEYS.tokenAcceso)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.tokenRefresco)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.usuario)).toBeNull()
      expect(window.location.href).toBe('/login?sesionExpirada=1&returnTo=%2Fperfil')
    })
    
    it('debería agregar returnTo si se especifica (y no es pública)', () => {
      expulsarSesion('/admin/proyectos')
      expect(window.location.href).toBe('/login?sesionExpirada=1&returnTo=%2Fadmin%2Fproyectos')
    })

    it('no debería redirigir si está en una ruta pública', () => {
      window.location.pathname = '/catalogo'
      expulsarSesion()
      // href is not modified
      expect(window.location.href).toBe('')
    })
  })

  describe('interceptores de request', () => {
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled

    it('debería no agregar token si skipAuth está activo', async () => {
      localStorage.setItem(STORAGE_KEYS.tokenAcceso, 'token-valido')
      
      const config: any = { url: '/test', method: 'get', ...API_PUBLICO, headers: { Authorization: 'Bearer x' } }
      
      const result = await requestInterceptor(config)
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('no debería agregar token si es ruta auth pública', async () => {
      localStorage.setItem(STORAGE_KEYS.tokenAcceso, 'token')
      const config: any = { url: '/autenticacion/iniciar-sesion', method: 'post', headers: {} }
      const result = await requestInterceptor(config)
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('no debería agregar token si es registro público (sin token previo)', async () => {
      const config: any = { url: '/usuarios', method: 'post', headers: {} }
      const result = await requestInterceptor(config)
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('debería agregar token si está en localStorage y es válido (no skipAuth)', async () => {
      const tokenNoExpirado = 'header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })) + '.sign'
      localStorage.setItem(STORAGE_KEYS.tokenAcceso, tokenNoExpirado)
      
      const config: any = { url: '/test', method: 'get', headers: {} }
      const result = await requestInterceptor(config)
      
      expect(result.headers.Authorization).toBe(`Bearer ${tokenNoExpirado}`)
    })

    it('no debería agregar token si está expirado y no hay token de refresco', async () => {
      const tokenExpirado = 'header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })) + '.sign'
      localStorage.setItem(STORAGE_KEYS.tokenAcceso, tokenExpirado)
      
      const config: any = { url: '/test', method: 'get', headers: {} }
      const result = await requestInterceptor(config)
      
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('debería refrescar el token si está expirado y hay token de refresco', async () => {
      const tokenExpirado = 'header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })) + '.sign'
      localStorage.setItem(STORAGE_KEYS.tokenAcceso, tokenExpirado)
      localStorage.setItem(STORAGE_KEYS.tokenRefresco, 'old_refresh')
      
      const config: any = { url: '/test', method: 'get', headers: {} }
      const result = await requestInterceptor(config)
      
      expect(axiosPostSpy).toHaveBeenCalledTimes(1)
      expect(result.headers.Authorization).toBe('Bearer new_token')
      expect(localStorage.getItem(STORAGE_KEYS.tokenAcceso)).toBe('new_token')
      
      // Llamarlo por segunda vez mientras se resuelve para probar promesaRefresco 
      // (difícil de simular el timing aquí sin retrasar axiosPostSpy, pero pasará por la lógica base)
    })
  })

  describe('interceptores de response', () => {
    const responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected

    it('debería rechazar si es skipAuth (no hacer reintentos)', async () => {
      const error = { config: { skipAuth: true }, response: { status: 401 } }
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
    })

    it('debería rechazar si status no es 401 y loggear si hay response', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = { config: { url: '/test' }, response: { status: 500, data: 'err' } }
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
      expect(consoleSpy).toHaveBeenCalledWith('[API Error 500]:', 'err')
    })

    it('debería rechazar si status no es 401 y no hay response (network error)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = { config: { url: '/test' } }
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
      expect(consoleSpy).toHaveBeenCalledWith('[Network Error]: No se pudo conectar con el servidor backend.')
    })

    it('debería rechazar 401 en ruta de login sin intentar refresco', async () => {
      const error = { config: { url: '/autenticacion/iniciar-sesion', method: 'post' }, response: { status: 401 } }
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
    })

    it('debería expulsar y rechazar si el 401 es al intentar refrescar', async () => {
      localStorage.setItem(STORAGE_KEYS.tokenRefresco, 'refresh')
      window.location.pathname = '/perfil'
      
      const error = { config: { url: '/autenticacion/refrescar' }, response: { status: 401 } }
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
      
      expect(window.location.href).toBe('/login?sesionExpirada=1&returnTo=%2Fperfil')
      expect((error as any).sesionExpirada).toBe(true)
    })

    it('debería retornar response si es exitoso (status 200)', async () => {
      const response = { status: 200, data: 'ok' }
      const successInterceptor = (api.interceptors.response as any).handlers[0].fulfilled
      expect(await successInterceptor(response)).toBe(response)
    })

    it('debería expulsar y rechazar si _retry es true', async () => {
      localStorage.setItem(STORAGE_KEYS.tokenRefresco, 'refresh')
      window.location.pathname = '/perfil'
      
      const error = { config: { url: '/test', _retry: true }, response: { status: 401 } }
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
      expect(window.location.href).toContain('/login')
    })

    it('debería rechazar si no tenía sesión y da 401 (ej. expirada en server y sin localstorage)', async () => {
      const error = { config: { url: '/test' }, response: { status: 401 } }
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
    })

    it('debería reintentar la solicitud si tiene sesión y falla por 401', async () => {
      localStorage.setItem(STORAGE_KEYS.tokenRefresco, 'old_refresh')
      const config: any = { url: '/test', headers: {} }
      const error = { config, response: { status: 401 } }
      
      // Usaremos una pequeña trampa: mockeamos la llamada interna que hace el interceptor
      // El interceptor retorna `api(originalRequest)` 
      // api es una instancia de axios. mockeamos la invocación o reemplazamos api
      
      // En vitest, espiar una función exportada por default o creada const api = axios.create() es tricky si se usa a si misma como callable `api(config)`.
      // En `api.ts`: `return api(originalRequest)` => esto llama al callable.
      // Así que usaremos axiosPostSpy para retornar un token, y verificaremos que cambie los headers y _retry
      
      try {
        await responseErrorInterceptor(error)
      } catch (e) {
        // Esto fallará porque api() no está mockeado, pero capturamos los cambios en config
      }
      
      expect(config._retry).toBe(true)
      expect(config.headers.Authorization).toBe('Bearer new_token')
    })

    it('debería expulsar si falla intentarRefrescarToken (ej retorna null) durante el reintento', async () => {
      localStorage.setItem(STORAGE_KEYS.tokenRefresco, 'old_refresh')
      window.location.pathname = '/perfil'
      const config: any = { url: '/test', headers: {} }
      const error = { config, response: { status: 401 } }
      
      axiosPostSpy.mockRejectedValue(new Error('fail')) // intentarRefrescarToken retornará null
      
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
      expect(window.location.href).toContain('/login')
    })
  })
})
