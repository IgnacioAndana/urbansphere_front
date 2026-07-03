/**
 * Formato legible alineado con respuestas del MS Usuarios: dd-mm-yyyy HH:mm
 * Acepta ISO (mindicador.cl), dd-mm-yyyy HH:mm:ss del backend, etc.
 */
export function formatearFechaLegible(valor: string | null | undefined): string {
  if (!valor?.trim()) return ''

  const texto = valor.trim()

  const yaFormateada = texto.match(/^(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2})/)
  if (yaFormateada) {
    return `${yaFormateada[1]} ${yaFormateada[2]}`
  }

  const fecha = new Date(texto)
  if (Number.isNaN(fecha.getTime())) return texto

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`
}
