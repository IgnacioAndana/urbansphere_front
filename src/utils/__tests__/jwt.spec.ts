import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { decodificarPayloadJwt, tokenJwtExpirado, obtenerIdUsuarioDesdeToken } from '../jwt'

describe('jwt.ts', () => {
  // Función auxiliar para crear un token falso (solo la parte payload es importante aquí)
  const crearToken = (payload: any) => {
    const base64 = btoa(JSON.stringify(payload))
    return `header.${base64}.signature`
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('decodificarPayloadJwt', () => {
    it('debería retornar null si el token es inválido', () => {
      expect(decodificarPayloadJwt('invalid')).toBeNull()
      expect(decodificarPayloadJwt('header.invalid base64')).toBeNull()
    })

    it('debería decodificar correctamente el payload', () => {
      const payload = { userId: 123, role: 'admin' }
      const token = crearToken(payload)
      expect(decodificarPayloadJwt(token)).toEqual(payload)
    })
  })

  describe('tokenJwtExpirado', () => {
    it('debería retornar true si el token es nulo o vacío', () => {
      expect(tokenJwtExpirado(null)).toBe(true)
      expect(tokenJwtExpirado('')).toBe(true)
    })

    it('debería retornar false si no tiene exp', () => {
      const token = crearToken({ userId: 123 })
      expect(tokenJwtExpirado(token)).toBe(false)
    })

    it('debería retornar true si ya expiró (con margen de 30s)', () => {
      const ahoraMs = Date.now()
      // exp está en segundos
      const exp = Math.floor(ahoraMs / 1000) + 10 // Expira en 10s
      const token = crearToken({ exp })
      // margenSegundos por defecto es 30, así que si expira en 10s, ya se considera expirado (ahora >= exp - 30)
      expect(tokenJwtExpirado(token)).toBe(true)
    })

    it('debería retornar false si falta mucho para expirar', () => {
      const ahoraMs = Date.now()
      const exp = Math.floor(ahoraMs / 1000) + 3600 // Expira en 1 hora
      const token = crearToken({ exp })
      expect(tokenJwtExpirado(token)).toBe(false)
    })
  })

  describe('obtenerIdUsuarioDesdeToken', () => {
    it('debería retornar null si token es null', () => {
      expect(obtenerIdUsuarioDesdeToken(null)).toBeNull()
    })

    it('debería retornar null si payload es inválido', () => {
      expect(obtenerIdUsuarioDesdeToken('header.')).toBeNull() // payload no se puede parsear
    })

    it('debería retornar el ID desde diferentes keys (sub, id, userId, usuarioId)', () => {
      expect(obtenerIdUsuarioDesdeToken(crearToken({ sub: 1 }))).toBe(1)
      expect(obtenerIdUsuarioDesdeToken(crearToken({ id: 2 }))).toBe(2)
      expect(obtenerIdUsuarioDesdeToken(crearToken({ userId: 3 }))).toBe(3)
      expect(obtenerIdUsuarioDesdeToken(crearToken({ usuarioId: 4 }))).toBe(4)
    })

    it('debería parsear ID si es un string numérico', () => {
      expect(obtenerIdUsuarioDesdeToken(crearToken({ sub: '123' }))).toBe(123)
    })

    it('debería retornar null si el ID es string no numérico', () => {
      expect(obtenerIdUsuarioDesdeToken(crearToken({ sub: 'abc' }))).toBeNull()
    })

    it('debería retornar null si no hay ninguna key de id', () => {
      expect(obtenerIdUsuarioDesdeToken(crearToken({ role: 'admin' }))).toBeNull()
    })
  })
})
