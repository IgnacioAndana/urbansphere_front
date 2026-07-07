import { describe, it, expect } from 'vitest'
import {
  esEnteroPositivo,
  esSuperficieValida,
  esUfEntera,
  validarFechaEntrega,
  validarTipologiaForm,
  normalizarTipologiaDto,
} from '../validacionesProyecto'
import type { CrearTipologiaDto } from '../../types/proyectos'

describe('validacionesProyecto utils', () => {
  describe('esEnteroPositivo', () => {
    it('debería ser verdadero para enteros positivos', () => {
      expect(esEnteroPositivo(1)).toBe(true)
      expect(esEnteroPositivo(10)).toBe(true)
      expect(esEnteroPositivo('5')).toBe(true)
    })
    it('debería ser falso para menores a 1 o decimales', () => {
      expect(esEnteroPositivo(0)).toBe(false)
      expect(esEnteroPositivo(-5)).toBe(false)
      expect(esEnteroPositivo(1.5)).toBe(false)
    })
  })

  describe('esSuperficieValida', () => {
    it('debería ser verdadero para números positivos (enteros o decimales)', () => {
      expect(esSuperficieValida(1)).toBe(true)
      expect(esSuperficieValida(45.5)).toBe(true)
      expect(esSuperficieValida('50.2')).toBe(true)
    })
    it('debería ser falso para cero o negativos', () => {
      expect(esSuperficieValida(0)).toBe(false)
      expect(esSuperficieValida(-10)).toBe(false)
    })
  })

  describe('esUfEntera', () => {
    it('debería ser verdadero para enteros positivos', () => {
      expect(esUfEntera(2000)).toBe(true)
      expect(esUfEntera('3500')).toBe(true)
    })
    it('debería ser falso para decimales o menores a 1', () => {
      expect(esUfEntera(2000.5)).toBe(false)
      expect(esUfEntera(0)).toBe(false)
    })
  })

  describe('validarFechaEntrega', () => {
    it('debería devolver null si la fecha está vacía', () => {
      expect(validarFechaEntrega(null)).toBeNull()
      expect(validarFechaEntrega('')).toBeNull()
    })
    it('debería devolver null si la fecha es igual o mayor a hoy', () => {
      // Como mínimo validamos una fecha lejana en el futuro
      const fechaFutura = '2999-12-31'
      expect(validarFechaEntrega(fechaFutura)).toBeNull()
    })
    it('debería devolver error si la fecha es anterior a hoy', () => {
      const fechaPasada = '2000-01-01'
      expect(validarFechaEntrega(fechaPasada)).toBe('La fecha de entrega no puede ser anterior a hoy.')
    })
  })

  describe('validarTipologiaForm', () => {
    it('debería devolver null si todo el formulario es válido', () => {
      const form: CrearTipologiaDto = {
        codigoTipologia: '2D2B',
        dormitorios: 2,
        banos: 2,
        superficieM2: 50.5,
        valorEnUf: 2500,
      }
      expect(validarTipologiaForm(form)).toBeNull()
    })

    it('debería validar código de tipología', () => {
      const form = { codigoTipologia: ' ', dormitorios: 2, banos: 2, superficieM2: 50.5, valorEnUf: 2500 }
      expect(validarTipologiaForm(form as CrearTipologiaDto)).toBe('El código es obligatorio (ej: 2D2B).')
    })

    it('debería validar dormitorios', () => {
      const form = { codigoTipologia: '2D2B', dormitorios: 0, banos: 2, superficieM2: 50.5, valorEnUf: 2500 }
      expect(validarTipologiaForm(form as CrearTipologiaDto)).toBe('Dormitorios debe ser un número entero mayor a 0.')
    })

    it('debería validar baños', () => {
      const form = { codigoTipologia: '2D2B', dormitorios: 2, banos: 0, superficieM2: 50.5, valorEnUf: 2500 }
      expect(validarTipologiaForm(form as CrearTipologiaDto)).toBe('Baños debe ser un número entero mayor a 0.')
    })

    it('debería validar superficie', () => {
      const form = { codigoTipologia: '2D2B', dormitorios: 2, banos: 2, superficieM2: 0, valorEnUf: 2500 }
      expect(validarTipologiaForm(form as CrearTipologiaDto)).toBe('Superficie (m²) debe ser mayor a 0.')
    })

    it('debería validar valor UF', () => {
      const form = { codigoTipologia: '2D2B', dormitorios: 2, banos: 2, superficieM2: 50.5, valorEnUf: 2500.5 }
      expect(validarTipologiaForm(form as CrearTipologiaDto)).toBe('Valor UF debe ser un número entero mayor a 0 (sin decimales).')
    })
  })

  describe('normalizarTipologiaDto', () => {
    it('debería truncar decimales en enteros y retornar un nuevo objeto', () => {
      const form: CrearTipologiaDto = {
        codigoTipologia: ' 2D2B ',
        dormitorios: 2.9, // se debe truncar a 2
        banos: 2.1, // se debe truncar a 2
        superficieM2: 50.5, // se debe mantener
        valorEnUf: 2500.99 // se debe truncar a 2500
      }
      const normalizado = normalizarTipologiaDto(form)
      expect(normalizado).toEqual({
        codigoTipologia: '2D2B',
        dormitorios: 2,
        banos: 2,
        superficieM2: 50.5,
        valorEnUf: 2500,
      })
    })
  })
})
