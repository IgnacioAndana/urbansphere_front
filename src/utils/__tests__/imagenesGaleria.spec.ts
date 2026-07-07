import { describe, it, expect } from 'vitest'
import { ordenarImagenes } from '../imagenesGaleria'
import type { ProyectoImagen } from '../../types/proyectos'

describe('imagenesGaleria.ts', () => {
  describe('ordenarImagenes', () => {
    it('debería ordenar las imágenes por el campo orden de menor a mayor', () => {
      const imagenes = [
        { id: 1, orden: 3, esPortada: false },
        { id: 2, orden: 1, esPortada: true },
        { id: 3, orden: 2, esPortada: false }
      ] as ProyectoImagen[]

      const resultado = ordenarImagenes(imagenes)

      expect(resultado).toEqual([
        { id: 2, orden: 1, esPortada: true },
        { id: 3, orden: 2, esPortada: false },
        { id: 1, orden: 3, esPortada: false }
      ])
    })

    it('debería retornar un arreglo vacío si recibe un arreglo vacío', () => {
      expect(ordenarImagenes([])).toEqual([])
    })

    it('no debería mutar el arreglo original (debería retornar una copia ordenada)', () => {
      const imagenes = [
        { id: 1, orden: 2 },
        { id: 2, orden: 1 }
      ] as ProyectoImagen[]
      
      const resultado = ordenarImagenes(imagenes)
      
      expect(resultado).not.toBe(imagenes)
      expect(imagenes[0].orden).toBe(2)
      expect(resultado[0].orden).toBe(1)
    })

    it('debería ordenar usando el id como respaldo si no hay orden', () => {
      const imgSinOrden = [
        { id: 10 },
        { id: 2 },
        { id: 5 }
      ] as ProyectoImagen[]
      const result = ordenarImagenes(imgSinOrden)
      expect(result[0].id).toBe(2)
      expect(result[1].id).toBe(5)
      expect(result[2].id).toBe(10)
    })
  })
})
