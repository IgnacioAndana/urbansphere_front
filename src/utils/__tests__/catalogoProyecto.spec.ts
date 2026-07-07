import { describe, it, expect } from 'vitest'
import {
  obtenerUrlPortada,
  mapProyectoCatalogo,
  formatearRango,
  formatearPrecioUf,
  clpDesdeUf,
  ufDesdeClp,
  formatearPrecioClp,
  normalizarTipoProyecto,
  formatearTipoProyecto,
  extraerComunas,
  extraerDormitorios,
  extraerBanos,
  filtrarProyectosCatalogo,
  mensajeInteresDefault
} from '../catalogoProyecto'
import type { Proyecto, ProyectoImagen, Tipologia } from '../../types/proyectos'

describe('catalogoProyecto.ts', () => {
  describe('obtenerUrlPortada', () => {
    it('debería retornar la url de la imagen portada si existe', () => {
      const imagenes = [
        { id: 1, orden: 1, esPortada: false, urlS3: 'img1.jpg' },
        { id: 2, orden: 2, esPortada: true, urlS3: 'img2.jpg' }
      ] as ProyectoImagen[]
      expect(obtenerUrlPortada(imagenes)).toBe('img2.jpg')
    })

    it('debería retornar la url de la primera imagen si no hay portada', () => {
      const imagenes = [
        { id: 1, orden: 2, esPortada: false, urlS3: 'img1.jpg' },
        { id: 2, orden: 1, esPortada: false, urlS3: 'img2.jpg' } 
      ] as ProyectoImagen[]
      expect(obtenerUrlPortada(imagenes)).toBe('img2.jpg')
    })

    it('debería retornar null si el array está vacío', () => {
      expect(obtenerUrlPortada([])).toBeNull()
    })
  })

  describe('mapProyectoCatalogo', () => {
    it('debería mapear correctamente un proyecto con sus tipologías e imágenes', () => {
      const proyecto = {
        id: 1,
        titulo: 'Proyecto A',
        tipo: 'Departamento',
        comuna: 'Santiago',
        direccion: 'Av 123',
        latitud: -33,
        longitud: -70,
        descripcion: 'Desc',
        fechaEntregaEstimada: '2025'
      } as unknown as Proyecto

      const tipologias = [
        { dormitorios: 1, banos: 1, superficieM2: 50, valorEnUf: 2000 },
        { dormitorios: 2, banos: 2, superficieM2: 70, valorEnUf: 3000 }
      ] as Tipologia[]

      const imagenes = [
        { esPortada: true, urlS3: 'portada.jpg' }
      ] as ProyectoImagen[]

      const result = mapProyectoCatalogo(proyecto, tipologias, imagenes)

      expect(result).toEqual({
        id: 1,
        titulo: 'Proyecto A',
        tipo: 'departamento',
        comuna: 'Santiago',
        direccion: 'Av 123',
        latitud: -33,
        longitud: -70,
        descripcion: 'Desc',
        fechaEntregaEstimada: '2025',
        urlPortada: 'portada.jpg',
        precioDesdeUf: 2000,
        dormitoriosMin: 1,
        dormitoriosMax: 2,
        banosMin: 1,
        banosMax: 2,
        superficieMin: 50,
        superficieMax: 70
      })
    })

    it('debería mapear correctamente con tipologías vacías', () => {
      const proyecto = { id: 1, tipo: 'casa' } as unknown as Proyecto
      const result = mapProyectoCatalogo(proyecto, [], [])
      expect(result.precioDesdeUf).toBeNull()
      expect(result.dormitoriosMin).toBeNull()
      expect(result.urlPortada).toBeNull()
    })
  })

  describe('formatearRango', () => {
    it('debería retornar "—" si algún límite es nulo', () => {
      expect(formatearRango(null, 5)).toBe('—')
      expect(formatearRango(2, null)).toBe('—')
      expect(formatearRango(null, null)).toBe('—')
    })
    
    it('debería retornar un solo número si min y max son iguales', () => {
      expect(formatearRango(2, 2, ' dorm')).toBe('2 dorm')
    })

    it('debería retornar rango si son diferentes', () => {
      expect(formatearRango(1, 3, ' m2')).toBe('1 - 3 m2')
    })
  })

  describe('formatearPrecioUf', () => {
    it('debería manejar null', () => {
      expect(formatearPrecioUf(null)).toBe('Consultar')
    })
    it('debería formatear correctamente', () => {
      expect(formatearPrecioUf(2500)).toBe('UF 2.500')
    })
  })

  describe('clpDesdeUf', () => {
    it('debería retornar null si uf o valorUf son nulos o inválidos', () => {
      expect(clpDesdeUf(null, 30000)).toBeNull()
      expect(clpDesdeUf(2000, null)).toBeNull()
      expect(clpDesdeUf(2000, 0)).toBeNull()
    })
    it('debería calcular correctamente y redondear', () => {
      expect(clpDesdeUf(2, 35000.5)).toBe(70001)
    })
  })

  describe('ufDesdeClp', () => {
    it('debería retornar null para valores inválidos', () => {
      expect(ufDesdeClp(-100, 30000)).toBeNull()
      expect(ufDesdeClp(NaN, 30000)).toBeNull()
      expect(ufDesdeClp(100, 0)).toBeNull()
    })
    it('debería calcular correctamente', () => {
      expect(ufDesdeClp(70000, 35000)).toBe(2)
    })
  })

  describe('formatearPrecioClp', () => {
    it('debería manejar null', () => {
      expect(formatearPrecioClp(null)).toBe('')
    })
    it('debería formatear aproximado por defecto', () => {
      expect(formatearPrecioClp(1500000)).toBe('≈ $1.500.000')
    })
    it('debería formatear sin aproximado si se pide', () => {
      expect(formatearPrecioClp(1500000, { aproximado: false })).toBe('$1.500.000')
    })
  })

  describe('normalizarTipoProyecto y formatearTipoProyecto', () => {
    it('debería normalizar a casa o departamento', () => {
      expect(normalizarTipoProyecto('CASA')).toBe('casa')
      expect(normalizarTipoProyecto('Departamento')).toBe('departamento')
      expect(normalizarTipoProyecto('otro')).toBe('departamento')
      expect(normalizarTipoProyecto(null)).toBe('departamento')
    })
    it('debería formatear', () => {
      expect(formatearTipoProyecto('casa')).toBe('Casa')
      expect(formatearTipoProyecto('departamento')).toBe('Departamento')
    })
  })

  describe('extraerComunas, extraerDormitorios, extraerBanos', () => {
    const proyectos = [
      { comuna: 'Santiago', dormitoriosMin: 1, dormitoriosMax: 3, banosMin: 1, banosMax: 2 },
      { comuna: 'Providencia', dormitoriosMin: 2, dormitoriosMax: 2, banosMin: 2, banosMax: 3 },
      { comuna: 'Santiago', dormitoriosMin: null, dormitoriosMax: null, banosMin: null, banosMax: null },
      { comuna: '' }
    ] as any[]

    it('debería extraer y ordenar comunas únicas', () => {
      expect(extraerComunas(proyectos)).toEqual(['Providencia', 'Santiago'])
    })
    it('debería extraer valores de rango para dormitorios', () => {
      expect(extraerDormitorios(proyectos)).toEqual([1, 2, 3])
    })
    it('debería extraer valores de rango para baños', () => {
      expect(extraerBanos(proyectos)).toEqual([1, 2, 3])
    })
  })

  describe('filtrarProyectosCatalogo', () => {
    const proyectos = [
      { titulo: 'A', comuna: 'C1', tipo: 'casa', precioDesdeUf: 1000, dormitoriosMin: 1, dormitoriosMax: 2, banosMin: 1, banosMax: 1, direccion: 'Dir A' },
      { titulo: 'B', comuna: 'C2', tipo: 'departamento', precioDesdeUf: 3000, dormitoriosMin: 3, dormitoriosMax: 4, banosMin: 2, banosMax: 3, direccion: 'Dir B' },
      { titulo: 'C', comuna: 'C1', tipo: 'departamento', precioDesdeUf: null, dormitoriosMin: null, dormitoriosMax: null, banosMin: null, banosMax: null, direccion: 'Dir C' }
    ] as any[]

    it('debería filtrar por tipo', () => {
      expect(filtrarProyectosCatalogo(proyectos, { tipo: 'casa' }).length).toBe(1)
      expect(filtrarProyectosCatalogo(proyectos, { tipo: 'Todos' }).length).toBe(3)
    })
    
    it('debería filtrar por comuna', () => {
      expect(filtrarProyectosCatalogo(proyectos, { comuna: 'C1' }).length).toBe(2)
      expect(filtrarProyectosCatalogo(proyectos, { comuna: 'Todas' }).length).toBe(3)
    })

    it('debería filtrar por texto (titulo, comuna, direccion)', () => {
      expect(filtrarProyectosCatalogo(proyectos, { texto: 'Dir A' }).length).toBe(1)
      expect(filtrarProyectosCatalogo(proyectos, { texto: 'C2' }).length).toBe(1)
    })

    it('debería filtrar por rango de dormitorios', () => {
      expect(filtrarProyectosCatalogo(proyectos, { dormitorios: 1 }).length).toBe(1) 
      expect(filtrarProyectosCatalogo(proyectos, { dormitorios: 5 }).length).toBe(0) 
      expect(filtrarProyectosCatalogo(proyectos, { dormitorios: null }).length).toBe(3)
    })

    it('debería filtrar por rango de baños', () => {
      expect(filtrarProyectosCatalogo(proyectos, { banos: 3 }).length).toBe(1) 
    })

    it('debería filtrar por precioMin y precioMax', () => {
      expect(filtrarProyectosCatalogo(proyectos, { precioMin: 2000 }).length).toBe(2) // B y C
      expect(filtrarProyectosCatalogo(proyectos, { precioMax: 2000 }).length).toBe(2) // A y C
    })
  })

  describe('mensajeInteresDefault', () => {
    it('debería retornar el mensaje correcto', () => {
      expect(mensajeInteresDefault('Torre')).toBe('Hola, me gustaría recibir más información sobre el proyecto "Torre".')
    })
  })
})
