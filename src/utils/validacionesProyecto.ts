import type { CrearTipologiaDto } from '../types/proyectos'

/** Fecha local YYYY-MM-DD (para atributo min en inputs type="date") */
export function fechaMinimaHoyLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function esEnteroPositivo(valor: unknown): boolean {
  const num = Number(valor)
  return Number.isFinite(num) && Number.isInteger(num) && num >= 1
}

export function esSuperficieValida(valor: unknown): boolean {
  const num = Number(valor)
  return Number.isFinite(num) && num > 0
}

/** UF se comercializa en números enteros (sin decimales) */
export function esUfEntera(valor: unknown): boolean {
  const num = Number(valor)
  return Number.isFinite(num) && Number.isInteger(num) && num >= 1
}

export function validarFechaEntrega(fecha: string | undefined | null): string | null {
  const texto = fecha?.trim()
  if (!texto) return null
  if (texto < fechaMinimaHoyLocal()) {
    return 'La fecha de entrega no puede ser anterior a hoy.'
  }
  return null
}

export function validarTipologiaForm(form: CrearTipologiaDto): string | null {
  if (!form.codigoTipologia.trim()) {
    return 'El código es obligatorio (ej: 2D2B).'
  }
  if (!esEnteroPositivo(form.dormitorios)) {
    return 'Dormitorios debe ser un número entero mayor a 0.'
  }
  if (!esEnteroPositivo(form.banos)) {
    return 'Baños debe ser un número entero mayor a 0.'
  }
  if (!esSuperficieValida(form.superficieM2)) {
    return 'Superficie (m²) debe ser mayor a 0.'
  }
  if (!esUfEntera(form.valorEnUf)) {
    return 'Valor UF debe ser un número entero mayor a 0 (sin decimales).'
  }
  return null
}

export function normalizarTipologiaDto(form: CrearTipologiaDto): CrearTipologiaDto {
  return {
    codigoTipologia: form.codigoTipologia.trim(),
    dormitorios: Math.trunc(Number(form.dormitorios)),
    banos: Math.trunc(Number(form.banos)),
    superficieM2: Number(form.superficieM2),
    valorEnUf: Math.trunc(Number(form.valorEnUf)),
  }
}
