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
      const mockProyecto = { id: 1, titulo: 'Proyecto Test' }
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockProyecto })

      const dto: any = { titulo: 'Proyecto Test' }
      const resultado = await proyectosService.crear(dto)

      expect(api.post).toHaveBeenCalledWith('/proyectos', dto)
      expect(resultado).toEqual(mockProyecto)
    })
  })

  describe('listar', () => {
    it('debería hacer un GET a /proyectos', async () => {
      const mockLista = [{ id: 1 }]
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockLista })
      const resultado = await proyectosService.listar()
      expect(api.get).toHaveBeenCalledWith('/proyectos')
      expect(resultado).toEqual(mockLista)
    })
  })

  describe('listarPublico', () => {
    it('debería hacer un GET a /proyectos usando API_PUBLICO', async () => {
      const mockLista = [{ id: 1, titulo: 'Test 1' }]
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

  describe('listarCatalogoActivosPublico', () => {
    it('debería mapear los datos devueltos', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 1, tipo: 'CASA' }] })
      const resultado = await proyectosService.listarCatalogoActivosPublico()
      expect(api.get).toHaveBeenCalledWith('/proyectos/catalogo/activos', API_PUBLICO)
      expect(resultado[0].tipo).toBe('casa')
    })
    it('debería devolver un array vacío si data es undefined', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: undefined })
      const resultado = await proyectosService.listarCatalogoActivosPublico()
      expect(resultado).toEqual([])
    })
  })

  describe('obtenerDetalleCatalogoPublico', () => {
    it('debería obtener detalle público', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { id: 1 } })
      const resultado = await proyectosService.obtenerDetalleCatalogoPublico(1)
      expect(api.get).toHaveBeenCalledWith('/proyectos/catalogo/1', API_PUBLICO)
      expect(resultado).toEqual({ id: 1 })
    })
  })

  describe('obtenerPorIdPublico', () => {
    it('debería obtener por ID sin auth', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { id: 2 } })
      const resultado = await proyectosService.obtenerPorIdPublico(2)
      expect(api.get).toHaveBeenCalledWith('/proyectos/2', API_PUBLICO)
      expect(resultado).toEqual({ id: 2 })
    })
  })

  describe('consultarCatalogo', () => {
    it('debería consultar catálogo normal (con JWT)', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { items: [{ id: 1, tipo: 'CASA' }], omitidos: [{ id: 2, motivo: 'motivo' }] } })
      const resultado = await proyectosService.consultarCatalogo([1, 2])
      expect(api.post).toHaveBeenCalledWith('/proyectos/catalogo', { ids: [1, 2] })
      expect(resultado.items[0].tipo).toBe('casa')
      expect(resultado.omitidos[0].id).toBe(2)
      expect(resultado.omitidos[0].motivo).toBe('motivo')
    })
    it('debería retornar arrays vacíos si se envían IDs vacíos', async () => {
      const resultado = await proyectosService.consultarCatalogo([])
      expect(api.post).not.toHaveBeenCalled()
      expect(resultado).toEqual({ items: [], omitidos: [] })
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

  describe('obtenerPorId', () => {
    it('debería obtener proyecto autenticado', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { id: 3 } })
      const resultado = await proyectosService.obtenerPorId(3)
      expect(api.get).toHaveBeenCalledWith('/proyectos/3')
      expect(resultado).toEqual({ id: 3 })
    })
  })

  describe('actualizar', () => {
    it('debería hacer PATCH a /proyectos/:id', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: { id: 4, titulo: 'Mod' } })
      const resultado = await proyectosService.actualizar(4, { titulo: 'Mod' })
      expect(api.patch).toHaveBeenCalledWith('/proyectos/4', { titulo: 'Mod' })
      expect(resultado).toEqual({ id: 4, titulo: 'Mod' })
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
