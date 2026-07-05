import { ref } from 'vue'

export const MENSAJE_FAVORITOS_SIN_SESION =
  'Debes iniciar sesión para marcar o desmarcar propiedades como favoritas.'

const mensaje = ref('')

export function useAvisoFlotante() {
  function mostrar(texto: string) {
    mensaje.value = texto
  }

  function cerrar() {
    mensaje.value = ''
  }

  return { mensaje, mostrar, cerrar }
}
