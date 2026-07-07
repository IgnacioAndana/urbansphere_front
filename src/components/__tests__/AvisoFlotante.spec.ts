import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AvisoFlotante from '../AvisoFlotante.vue'
import { useAvisoFlotante } from '../../composables/useAvisoFlotante'
import { ref } from 'vue'

// Mock del composable
vi.mock('../../composables/useAvisoFlotante', () => ({
  useAvisoFlotante: vi.fn()
}))

describe('AvisoFlotante.vue', () => {
  let mensajeRef: any
  let cerrarMock: any

  beforeEach(() => {
    vi.clearAllMocks()
    mensajeRef = ref('')
    cerrarMock = vi.fn()
    
    vi.mocked(useAvisoFlotante).mockReturnValue({
      mensaje: mensajeRef,
      mostrar: vi.fn(),
      cerrar: cerrarMock
    })

    // Preparar el DOM para el Teleport a "body"
    document.body.innerHTML = ''
  })

  it('no debería renderizar nada si no hay mensaje', () => {
    mount(AvisoFlotante)
    expect(document.body.querySelector('.fixed')).toBeNull()
  })

  it('debería renderizar el modal cuando hay mensaje', async () => {
    mensajeRef.value = 'Un mensaje de prueba importante'
    mount(AvisoFlotante)
    
    // Esperar al siguiente tick para que Vue actualice el DOM reactivo
    await Promise.resolve()
    
    expect(document.body.textContent).toContain('Un mensaje de prueba importante')
    expect(document.body.textContent).toContain('Aviso')
    expect(document.body.textContent).toContain('Entendido')
  })

  it('debería llamar a cerrar al hacer clic en el botón Entendido', async () => {
    mensajeRef.value = 'Cerrar prueba'
    mount(AvisoFlotante)
    
    await Promise.resolve()
    
    const boton = document.querySelector('button')
    expect(boton).not.toBeNull()
    
    if (boton) {
      boton.click()
    }
    
    expect(cerrarMock).toHaveBeenCalledTimes(1)
  })

  it('debería llamar a cerrar al hacer clic fuera del modal', async () => {
    mensajeRef.value = 'Click fuera'
    mount(AvisoFlotante)
    
    await Promise.resolve()
    
    // El div de fondo tiene la clase fixed inset-0 que captura clicks para cerrar
    const backdrop = document.querySelector('.fixed.inset-0')
    expect(backdrop).not.toBeNull()
    
    if (backdrop) {
      backdrop.dispatchEvent(new Event('click'))
    }
    
    expect(cerrarMock).toHaveBeenCalledTimes(1)
  })

  it('debería destruir el inner div si el mensaje pasa a vacío', async () => {
    mensajeRef.value = 'Mensaje inicial'
    mount(AvisoFlotante)
    await Promise.resolve() // Render initial

    expect(document.body.textContent).toContain('Mensaje inicial')

    // Cambiar a falso
    mensajeRef.value = ''
    await Promise.resolve()

    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull()
  })
})
