import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BotonFavoritoProyecto from '../BotonFavoritoProyecto.vue'
import { useFavoritos } from '../../../composables/useFavoritos'
import { useAvisoFlotante, MENSAJE_FAVORITOS_SIN_SESION } from '../../../composables/useAvisoFlotante'
import { ref } from 'vue'

// Mocks
vi.mock('../../../composables/useFavoritos', () => ({
  useFavoritos: vi.fn()
}))

vi.mock('../../../composables/useAvisoFlotante', () => ({
  useAvisoFlotante: vi.fn(),
  MENSAJE_FAVORITOS_SIN_SESION: 'Debes iniciar sesión para marcar o desmarcar propiedades como favoritas.'
}))

describe('BotonFavoritoProyecto.vue', () => {
  let puedeUsarFavoritosRef: any
  let esFavoritoMock: any
  let alternarFavoritoMock: any
  let mostrarMock: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    puedeUsarFavoritosRef = ref(true)
    esFavoritoMock = vi.fn().mockReturnValue(false)
    alternarFavoritoMock = vi.fn().mockResolvedValue(true)
    
    vi.mocked(useFavoritos).mockReturnValue({
      puedeUsarFavoritos: puedeUsarFavoritosRef,
      esFavorito: esFavoritoMock,
      alternarFavorito: alternarFavoritoMock,
      idsFavoritos: ref(new Set()),
      cargandoFavoritos: ref(false),
      cargarFavoritos: vi.fn()
    })
    
    mostrarMock = vi.fn()
    vi.mocked(useAvisoFlotante).mockReturnValue({
      mensaje: ref(''),
      mostrar: mostrarMock,
      cerrar: vi.fn()
    })
  })

  it('debería renderizar correctamente en estado inactivo con variant card', () => {
    const wrapper = mount(BotonFavoritoProyecto, {
      props: { proyectoId: 1 }
    })
    
    expect(esFavoritoMock).toHaveBeenCalledWith(1)
    // El botón debe tener las clases por defecto y no las clases activas
    expect(wrapper.classes()).not.toContain('bg-red-50')
    expect(wrapper.classes()).toContain('px-3')
    expect(wrapper.attributes('title')).toBe('Agregar a favoritos')
  })

  it('debería renderizar como activo si el proyecto es favorito con variant card', () => {
    esFavoritoMock.mockReturnValue(true)
    
    const wrapper = mount(BotonFavoritoProyecto, {
      props: { proyectoId: 1 }
    })
    
    expect(wrapper.classes()).toContain('bg-red-50')
    expect(wrapper.classes()).toContain('text-red-500')
    expect(wrapper.attributes('title')).toBe('Quitar de favoritos')
  })

  it('debería renderizar correctamente en estado inactivo con variant detail', () => {
    const wrapper = mount(BotonFavoritoProyecto, {
      props: { proyectoId: 1, variant: 'detail' }
    })
    
    expect(wrapper.classes()).toContain('w-10')
    expect(wrapper.classes()).toContain('h-10')
    expect(wrapper.classes()).toContain('rounded-full')
    expect(wrapper.classes()).not.toContain('bg-red-50')
  })

  it('debería renderizar como activo si el proyecto es favorito con variant detail', () => {
    esFavoritoMock.mockReturnValue(true)
    
    const wrapper = mount(BotonFavoritoProyecto, {
      props: { proyectoId: 1, variant: 'detail' }
    })
    
    expect(wrapper.classes()).toContain('w-10')
    expect(wrapper.classes()).toContain('bg-red-50')
    expect(wrapper.classes()).toContain('text-red-500')
  })

  it('debería llamar a alternarFavorito y emitir el evento al hacer clic si el usuario puede usar favoritos', async () => {
    const wrapper = mount(BotonFavoritoProyecto, {
      props: { proyectoId: 1 }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(alternarFavoritoMock).toHaveBeenCalledWith(1)
    expect(wrapper.emitted('cambio')).toBeTruthy()
    expect(wrapper.emitted('cambio')?.[0]).toEqual([false]) // eraFavorito era false
  })

  it('debería llamar a alternarFavorito pero NO emitir el evento si falla la llamada', async () => {
    alternarFavoritoMock.mockResolvedValue(false)
    const wrapper = mount(BotonFavoritoProyecto, {
      props: { proyectoId: 1 }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(alternarFavoritoMock).toHaveBeenCalledWith(1)
    expect(wrapper.emitted('cambio')).toBeFalsy()
  })

  it('debería mostrar mensaje de aviso y NO alternar favorito si el usuario no puede usar favoritos', async () => {
    puedeUsarFavoritosRef.value = false
    
    const wrapper = mount(BotonFavoritoProyecto, {
      props: { proyectoId: 1 }
    })
    
    expect(wrapper.attributes('title')).toBe('Inicia sesión para guardar favoritos')

    await wrapper.find('button').trigger('click')
    
    expect(alternarFavoritoMock).not.toHaveBeenCalled()
    expect(mostrarMock).toHaveBeenCalledWith(MENSAJE_FAVORITOS_SIN_SESION)
    expect(wrapper.emitted('cambio')).toBeFalsy()
  })
})
