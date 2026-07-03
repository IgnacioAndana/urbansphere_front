import { ref, computed } from 'vue'
import { favoritosService, authService } from '../services/usuarios'
import { esUsuarioEstandar } from '../constants/roles'
import { aEnteroPositivo } from '../utils/numeros'

const idsFavoritos = ref<Set<number>>(new Set())
const cargandoFavoritos = ref(false)

export function useFavoritos() {
  const puedeUsarFavoritos = computed(() => {
    if (!authService.estaAutenticado()) return false
    return esUsuarioEstandar(authService.obtenerRolIdLocal())
  })

  function esFavorito(proyectoId: number | string): boolean {
    const id = aEnteroPositivo(proyectoId)
    return idsFavoritos.value.has(id)
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

  async function alternarFavorito(proyectoId: number | string): Promise<boolean> {
    if (!puedeUsarFavoritos.value) return false

    const id = aEnteroPositivo(proyectoId)
    const eraFavorito = esFavorito(id)
    try {
      if (eraFavorito) {
        await favoritosService.eliminarFavorito(id)
        idsFavoritos.value.delete(id)
      } else {
        await favoritosService.agregarFavorito(id)
        idsFavoritos.value.add(id)
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
