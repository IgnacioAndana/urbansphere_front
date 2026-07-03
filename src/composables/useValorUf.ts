import { ref, computed } from 'vue'
import { valorUfService } from '../services/valorUfService'

const valor = ref<number | null>(null)
const fecha = ref<string | null>(null)
const esFallback = ref(false)
const cargando = ref(false)
let promesaCarga: Promise<void> | null = null

async function cargarValorUf() {
  if (valor.value != null) return
  if (promesaCarga) {
    await promesaCarga
    return
  }

  cargando.value = true
  promesaCarga = valorUfService
    .obtener()
    .then((data) => {
      valor.value = data.valor
      fecha.value = data.fecha
      esFallback.value = data.esFallback
    })
    .finally(() => {
      cargando.value = false
      promesaCarga = null
    })

  await promesaCarga
}

export function useValorUf() {
  const listo = computed(() => valor.value != null)

  return {
    valorUf: valor,
    fechaUf: fecha,
    ufEsFallback: esFallback,
    cargandoUf: cargando,
    listo,
    cargarValorUf,
  }
}
