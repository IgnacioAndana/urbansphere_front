import { describe, it, expect, vi, beforeEach } from 'vitest'
import { proyectosService } from '../proyectosService'
import api, { API_PUBLICO } from '../../api'

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  },
  API_PUBLICO: { skipAuth: true }
}))

describe('proyectosService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('crear', () => {
    it('debería hacer un POST a /proyectos', async () => {
      const mockProyecto = { id: 1, nombre: 'Proyecto Test' }
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockProyecto })

      const dto: any = { nombre: 'Proyecto Test' }
      const resultado = await proyectosService.crear(dto)

      expect(api.post).toHaveBeenCalledWith('/proyectos', dto)
      expect(resultado).toEqual(mockProyecto)
    })
  })

  describe('listarPublico', () => {
    it('debería hacer un GET a /proyectos usando API_PUBLICO', async () => {
      const mockLista = [{ id: 1, nombre: 'Test 1' }]
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockLista })

      const resultado = await proyectosService.listarPublico()

      expect(api.get).toHaveBeenCalledWith('/proyectos', API_PUBLICO)
      expect(resultado).toEqual(mockLista)
    })
    
    it('debería devolver un array vacío si data es undefined', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: undefined })
      const resultado = await proyectosService.listarPublico()
      expect(resultado).toEqual([])
    })
  })

  describe('consultarCatalogoPublico', () => {
    it('debería hacer POST a /proyectos/catalogo filtrando ids duplicados', async () => {
      const mockResponse = {
        items: [{ id: 1, tipo: 'CASA' }],
        omitidos: [{ id: 2, motivo: 'no_encontrado' }]
      }
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse })

      const resultado = await proyectosService.consultarCatalogoPublico([1, 1, 2, '2'] as any)

      expect(api.post).toHaveBeenCalledWith('/proyectos/catalogo', { ids: [1, 2] }, API_PUBLICO)
      // Verifica normalización
      expect(resultado.items[0].id).toBe(1)
      expect(resultado.omitidos[0].id).toBe(2)
    })

    it('debería devolver vacío si no hay ids únicos válidos', async () => {
      const resultado = await proyectosService.consultarCatalogoPublico([])
      expect(api.post).not.toHaveBeenCalled()
      expect(resultado).toEqual({ items: [], omitidos: [] })
    })
  })

  describe('eliminar', () => {
    it('debería hacer un DELETE a /proyectos/:id', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({})
      await proyectosService.eliminar(5)
      expect(api.delete).toHaveBeenCalledWith('/proyectos/5')
    })
  })
})
