import { describe, it, expect, beforeEach } from 'vitest'
import { useAvisoFlotante, MENSAJE_FAVORITOS_SIN_SESION } from '../useAvisoFlotante'

describe('useAvisoFlotante composable', () => {
  beforeEach(() => {
    // Resetear el estado global antes de cada test
    const { cerrar } = useAvisoFlotante()
    cerrar()
  })

  it('debería inicializar con el mensaje vacío', () => {
    const { mensaje } = useAvisoFlotante()
    expect(mensaje.value).toBe('')
  })

  it('debería mostrar un mensaje', () => {
    const { mensaje, mostrar } = useAvisoFlotante()
    mostrar('Prueba de mensaje')
    expect(mensaje.value).toBe('Prueba de mensaje')
  })

  it('debería cerrar (vaciar) el mensaje', () => {
    const { mensaje, mostrar, cerrar } = useAvisoFlotante()
    mostrar('Prueba')
    expect(mensaje.value).toBe('Prueba')
    cerrar()
    expect(mensaje.value).toBe('')
  })

  it('debería exportar la constante MENSAJE_FAVORITOS_SIN_SESION correcta', () => {
    expect(MENSAJE_FAVORITOS_SIN_SESION).toBe('Debes iniciar sesión para marcar o desmarcar propiedades como favoritas.')
  })
})
