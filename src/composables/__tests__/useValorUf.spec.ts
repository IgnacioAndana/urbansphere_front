import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useValorUf } from '../useValorUf'
import { valorUfService } from '../../services/valorUfService'

// Mock de la dependencia
vi.mock('../../services/valorUfService', () => ({
  valorUfService: {
    obtener: vi.fn(),
  },
}))

describe('useValorUf composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Resetear estado del composable antes de cada test. 
    // Como es estado global en el archivo, forzamos un reseteo si es necesario
    const { valorUf, fechaUf, ufEsFallback, cargandoUf } = useValorUf()
    valorUf.value = null
    fechaUf.value = null
    ufEsFallback.value = false
    cargandoUf.value = false
  })

  it('debería inicializar con valores por defecto', () => {
    const { valorUf, fechaUf, ufEsFallback, cargandoUf, listo } = useValorUf()
    expect(valorUf.value).toBeNull()
    expect(fechaUf.value).toBeNull()
    expect(ufEsFallback.value).toBe(false)
    expect(cargandoUf.value).toBe(false)
    expect(listo.value).toBe(false)
  })

  it('debería cargar el valor uf correctamente', async () => {
    const mockData = {
      valor: 35000.5,
      fecha: '2024-01-01',
      esFallback: false
    }
    vi.mocked(valorUfService.obtener).mockResolvedValueOnce(mockData)

    const { cargarValorUf, valorUf, fechaUf, ufEsFallback, listo, cargandoUf } = useValorUf()
    
    // Al iniciar la carga
    const promise = cargarValorUf()
    expect(cargandoUf.value).toBe(true)
    
    await promise

    // Al finalizar la carga
    expect(cargandoUf.value).toBe(false)
    expect(valorUf.value).toBe(35000.5)
    expect(fechaUf.value).toBe('2024-01-01')
    expect(ufEsFallback.value).toBe(false)
    expect(listo.value).toBe(true)
    expect(valorUfService.obtener).toHaveBeenCalledTimes(1)
  })

  it('no debería volver a cargar si ya tiene valor', async () => {
    const mockData = { valor: 35000, fecha: '2024-01-01', esFallback: false }
    vi.mocked(valorUfService.obtener).mockResolvedValueOnce(mockData)

    const { cargarValorUf } = useValorUf()
    await cargarValorUf()
    await cargarValorUf() // Segunda llamada
    
    expect(valorUfService.obtener).toHaveBeenCalledTimes(1) // Sólo se llamó una vez
  })

  it('debería esperar a la promesa si se llama concurrentemente', async () => {
    // Simulamos una promesa que tarda un poco
    let resolveObtener: (value: any) => void
    const promesaFalsa = new Promise<any>((resolve) => {
      resolveObtener = resolve
    })
    
    vi.mocked(valorUfService.obtener).mockReturnValueOnce(promesaFalsa)

    const { cargarValorUf, cargandoUf } = useValorUf()
    
    // Llamadas concurrentes
    const p1 = cargarValorUf()
    const p2 = cargarValorUf()

    expect(cargandoUf.value).toBe(true)
    expect(valorUfService.obtener).toHaveBeenCalledTimes(1)

    // Resolvemos la promesa base
    resolveObtener!({ valor: 36000, fecha: '2024-02-01', esFallback: false })

    await p1
    await p2

    expect(valorUfService.obtener).toHaveBeenCalledTimes(1)
  })
})
