import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import api, { expulsarSesion, STORAGE_KEYS, API_PUBLICO } from '../api'
import axios from 'axios'
import { API_BASE_URL } from '../../config/env'

describe('api service', () => {
  const originalLocation = window.location

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    
    // Mock de window.location
    delete (window as any).location
    window.location = { ...originalLocation, href: '', pathname: '/', search: '' } as any
  })

  afterEach(() => {
    window.location = originalLocation
  })

  describe('expulsarSesion', () => {
    it('debería limpiar localStorage y redirigir al login', () => {
      localStorage.setItem(STORAGE_KEYS.tokenAcceso, 'token')
      localStorage.setItem(STORAGE_KEYS.tokenRefresco, 'refresh')
      localStorage.setItem(STORAGE_KEYS.usuario, '{}')

      expulsarSesion()

      expect(localStorage.getItem(STORAGE_KEYS.tokenAcceso)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.tokenRefresco)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.usuario)).toBeNull()
      expect(window.location.href).toBe('/login?sesionExpirada=1')
    })
    
    it('debería agregar returnTo si se especifica', () => {
      expulsarSesion('/catalogo')
      expect(window.location.href).toBe('/login?sesionExpirada=1&returnTo=%2Fcatalogo')
    })
  })

  describe('interceptores de request', () => {
    it('debería no agregar token si skipAuth está activo', async () => {
      localStorage.setItem(STORAGE_KEYS.tokenAcceso, 'token-valido')
      
      const config: any = { url: '/test', method: 'get', headers: { Authorization: 'Bearer x' }, ...API_PUBLICO }
      
      // Accedemos a la función del interceptor de request directamente
      const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled
      const result = await requestInterceptor(config)
      
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('debería agregar token si está en localStorage y es válido (no skipAuth)', async () => {
      // Un token que simule no estar expirado
      const tokenNoExpirado = 'header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })) + '.sign'
      localStorage.setItem(STORAGE_KEYS.tokenAcceso, tokenNoExpirado)
      
      const config: any = { url: '/test', method: 'get', headers: {} }
      const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled
      const result = await requestInterceptor(config)
      
      expect(result.headers.Authorization).toBe(`Bearer ${tokenNoExpirado}`)
    })
  })
})
