import { describe, it, expect } from 'vitest'
import { normalizarPathname, esRutaPublicaApp } from '../rutasPublicas'

describe('rutasPublicas.ts', () => {
  describe('normalizarPathname', () => {
    it('debería remover query params', () => {
      expect(normalizarPathname('/ruta?param=1')).toBe('/ruta')
      expect(normalizarPathname('/?param=1')).toBe('/')
    })

    it('debería retornar / si está en la raíz', () => {
      expect(normalizarPathname('/')).toBe('/')
    })

    it('debería retornar / si el string sin query queda vacío', () => {
      expect(normalizarPathname('')).toBe('/')
      // Para cubrir el fallback ?? '/' de un split vacío (imposible con strings normales)
      const fakeStr = { split: () => [] } as any
      expect(normalizarPathname(fakeStr)).toBe('/')
    })

    it('debería remover los slashes finales', () => {
      expect(normalizarPathname('/catalogo/')).toBe('/catalogo')
      expect(normalizarPathname('/ruta/con/slash//')).toBe('/ruta/con/slash')
    })
    
    it('debería devolver / si al final queda vacío', () => {
      expect(normalizarPathname('//')).toBe('/')
    })
  })

  describe('esRutaPublicaApp', () => {
    it('debería retornar true para rutas exactas públicas', () => {
      expect(esRutaPublicaApp('/')).toBe(true)
      expect(esRutaPublicaApp('/login')).toBe(true)
      expect(esRutaPublicaApp('/registro')).toBe(true)
      expect(esRutaPublicaApp('/catalogo')).toBe(true)
    })

    it('debería retornar true para rutas dinámicas de propiedad', () => {
      expect(esRutaPublicaApp('/propiedad/123')).toBe(true)
      expect(esRutaPublicaApp('/propiedad/1')).toBe(true)
    })

    it('debería retornar false para rutas protegidas o inexistentes', () => {
      expect(esRutaPublicaApp('/admin')).toBe(false)
      expect(esRutaPublicaApp('/dashboard')).toBe(false)
      expect(esRutaPublicaApp('/propiedad/')).toBe(false) // Sin ID numérico
      expect(esRutaPublicaApp('/propiedad/abc')).toBe(false) // ID no numérico
    })
  })
})
