import { describe, it, expect } from 'vitest'
import { formatearFechaLegible } from '../fechas'

describe('fechas utils', () => {
  describe('formatearFechaLegible', () => {
    it('debería retornar string vacío si se pasa null o undefined', () => {
      expect(formatearFechaLegible(null)).toBe('')
      expect(formatearFechaLegible(undefined)).toBe('')
      expect(formatearFechaLegible('')).toBe('')
      expect(formatearFechaLegible('   ')).toBe('')
    })

    it('debería retornar el texto sin cambios (removiendo segundos) si ya tiene el formato dd-mm-yyyy HH:mm:ss', () => {
      expect(formatearFechaLegible('25-12-2023 15:30:45')).toBe('25-12-2023 15:30')
      expect(formatearFechaLegible('01-01-2024 09:05:00')).toBe('01-01-2024 09:05')
    })

    it('debería formatear correctamente una fecha ISO a dd-mm-yyyy HH:mm local', () => {
      // Usamos una fecha específica en UTC y esperamos que maneje correctamente el objeto Date.
      // Dado que new Date() usa la zona horaria local, vamos a usar un timestamp simulado o asegurarnos de que formatea como se espera
      const fecha = new Date(2023, 11, 25, 15, 30) // 25 Dic 2023 15:30 local
      expect(formatearFechaLegible(fecha.toISOString())).toBe('25-12-2023 15:30')
    })

    it('debería devolver el texto original si la fecha es inválida', () => {
      expect(formatearFechaLegible('texto invalido')).toBe('texto invalido')
    })
  })
})
