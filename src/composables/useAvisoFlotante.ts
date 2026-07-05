import { ref } from 'vue'

export const MENSAJE_FAVORITOS_SIN_SESION =
  'Debes iniciar sesión para marcar o desmarcar propiedades como favoritas.'

const mensaje = ref('')
let timeoutId: ReturnType<typeof setTimeout> | undefined

export function useAvisoFlotante() {
  function mostrar(texto: string, duracionMs = 4500) {
    mensaje.value = texto
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      mensaje.value = ''
    }, duracionMs)
  }

  function cerrar() {
    mensaje.value = ''
    if (timeoutId) clearTimeout(timeoutId)
  }

  return { mensaje, mostrar, cerrar }
}
