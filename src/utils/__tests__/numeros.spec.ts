import { describe, it, expect } from 'vitest'
import { aEnteroPositivo, aEnteroPositivoNullable, normalizarIdsNumericos } from '../numeros'

describe('numeros utils', () => {
  describe('aEnteroPositivo', () => {
    it('debería retornar el mismo número si es un entero positivo', () => {
      expect(aEnteroPositivo(5)).toBe(5)
    })

    it('debería convertir un string numérico a número si es un entero positivo', () => {
      expect(aEnteroPositivo('10')).toBe(10)
    })

    it('debería lanzar error si el número es cero o negativo', () => {
      expect(() => aEnteroPositivo(0)).toThrow('Identificador numérico inválido')
      expect(() => aEnteroPositivo(-5)).toThrow('Identificador numérico inválido')
    })

    it('debería lanzar error si no es un número válido', () => {
      expect(() => aEnteroPositivo('texto')).toThrow('Identificador numérico inválido')
      expect(() => aEnteroPositivo(NaN)).toThrow('Identificador numérico inválido')
      expect(() => aEnteroPositivo(null)).toThrow('Identificador numérico inválido')
    })
  })

  describe('aEnteroPositivoNullable', () => {
    it('debería retornar el número si es válido', () => {
      expect(aEnteroPositivoNullable(5)).toBe(5)
      expect(aEnteroPositivoNullable('10')).toBe(10)
    })

    it('debería retornar null si es inválido', () => {
      expect(aEnteroPositivoNullable(0)).toBeNull()
      expect(aEnteroPositivoNullable(-5)).toBeNull()
      expect(aEnteroPositivoNullable('texto')).toBeNull()
      expect(aEnteroPositivoNullable(null)).toBeNull()
    })
  })

  describe('normalizarIdsNumericos', () => {
    it('debería filtrar valores inválidos y devolver solo números', () => {
      const valores = [1, '2', 'texto', 0, -5, null, 10]
      expect(normalizarIdsNumericos(valores)).toEqual([1, 2, 10])
    })

    it('debería devolver un arreglo vacío si todos son inválidos', () => {
      const valores = ['texto', 0, -5, null]
      expect(normalizarIdsNumericos(valores)).toEqual([])
    })
  })
})
