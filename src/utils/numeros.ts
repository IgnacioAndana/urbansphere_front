/** Convierte a entero positivo para IDs enviados al BFF (evita strings en JSON). */
export function aEnteroPositivo(valor: unknown): number {
  const n = typeof valor === 'number' ? valor : Number(valor)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error('Identificador numérico inválido')
  }
  return n
}

/** Igual que aEnteroPositivo pero devuelve null si no es válido. */
export function aEnteroPositivoNullable(valor: unknown): number | null {
  try {
    return aEnteroPositivo(valor)
  } catch {
    return null
  }
}

/** Normaliza un array de IDs que pueden venir como string desde la API. */
export function normalizarIdsNumericos(valores: unknown[]): number[] {
  return valores
    .map((v) => aEnteroPositivoNullable(v))
    .filter((v): v is number => v !== null)
}
