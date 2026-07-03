import { UF_VALOR_CLP_FALLBACK } from '../config/env'

const CACHE_KEY = 'urbansphere_valor_uf'
const CACHE_TTL_MS = 60 * 60 * 1000

interface CacheValorUf {
  valor: number
  fecha: string
  ts: number
}

interface MindicadorApiResp {
  uf?: { fecha?: string; valor?: number }
}

function leerCache(): CacheValorUf | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheValorUf
    if (!parsed.valor || Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function guardarCache(valor: number, fecha: string) {
  const entry: CacheValorUf = { valor, fecha, ts: Date.now() }
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry))
}

/** Valor UF en pesos chilenos (mindicador.cl, con fallback en env). */
export const valorUfService = {
  async obtener(): Promise<{ valor: number; fecha: string | null; esFallback: boolean }> {
    const cache = leerCache()
    if (cache) {
      return { valor: cache.valor, fecha: cache.fecha, esFallback: false }
    }

    try {
      const res = await fetch('https://mindicador.cl/api', {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error('mindicador no disponible')
      const data = (await res.json()) as MindicadorApiResp
      const valor = data.uf?.valor
      if (typeof valor !== 'number' || valor <= 0) throw new Error('valor UF inválido')
      const fecha = data.uf?.fecha ?? null
      guardarCache(valor, fecha ?? '')
      return { valor, fecha, esFallback: false }
    } catch {
      return {
        valor: UF_VALOR_CLP_FALLBACK,
        fecha: null,
        esFallback: true,
      }
    }
  },
}
