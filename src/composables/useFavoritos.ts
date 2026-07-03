import { ref, computed } from 'vue'
import { favoritosService, authService } from '../services/usuarios'
import { esUsuarioEstandar } from '../constants/roles'

const idsFavoritos = ref<Set<number>>(new Set())
const cargandoFavoritos = ref(false)

export function useFavoritos() {
  const puedeUsarFavoritos = computed(() => {
    if (!authService.estaAutenticado()) return false
    return esUsuarioEstandar(authService.obtenerRolIdLocal())
  })

  function esFavorito(proyectoId: number): boolean {
    return idsFavoritos.value.has(proyectoId)
  }

  async function cargarFavoritos() {
    if (!puedeUsarFavoritos.value) {
      idsFavoritos.value = new Set()
      return
    }
    cargandoFavoritos.value = true
    try {
      const ids = await favoritosService.obtenerIdsFavoritos()
      idsFavoritos.value = new Set(ids)
    } catch {
      idsFavoritos.value = new Set()
    } finally {
      cargandoFavoritos.value = false
    }
  }

  async function alternarFavorito(proyectoId: number): Promise<boolean> {
    if (!puedeUsarFavoritos.value) return false

    const eraFavorito = esFavorito(proyectoId)
    try {
      if (eraFavorito) {
        await favoritosService.eliminarFavorito(proyectoId)
        idsFavoritos.value.delete(proyectoId)
      } else {
        await favoritosService.agregarFavorito(proyectoId)
        idsFavoritos.value.add(proyectoId)
      }
      idsFavoritos.value = new Set(idsFavoritos.value)
      return true
    } catch {
      return false
    }
  }

  return {
    idsFavoritos,
    cargandoFavoritos,
    puedeUsarFavoritos,
    esFavorito,
    cargarFavoritos,
    alternarFavorito,
  }
}
