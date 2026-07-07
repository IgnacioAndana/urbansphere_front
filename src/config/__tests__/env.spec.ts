import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('env.ts', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('debería usar valores por defecto si env vars no existen o son vacías', async () => {
    vi.stubEnv('VITE_API_BASE_URL', ' ')
    vi.stubEnv('VITE_GEMINI_API_KEY', ' ')
    vi.stubEnv('VITE_MAX_IMAGEN_MB', ' ') 
    vi.stubEnv('VITE_UF_VALOR_CLP', ' ')
    
    const env = await import('../env')
    expect(env.API_BASE_URL).toBe('http://13.222.88.101/api')
    expect(env.tieneGeminiConfigurada()).toBe(false)
    expect(env.MAX_IMAGEN_MB).toBe(10)
    expect(env.UF_VALOR_CLP_FALLBACK).toBe(39000)
  })

  it('debería usar valores por defecto si env vars son inválidas (NaN o negativas)', async () => {
    vi.stubEnv('VITE_MAX_IMAGEN_MB', 'abc') // NaN branch
    vi.stubEnv('VITE_UF_VALOR_CLP', '-5') // <= 0 branch
    
    const env = await import('../env')
    expect(env.MAX_IMAGEN_MB).toBe(10)
    expect(env.UF_VALOR_CLP_FALLBACK).toBe(39000)
  })

  it('debería usar env vars si son válidas', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://custom/api ')
    vi.stubEnv('VITE_GEMINI_API_KEY', ' secret ')
    vi.stubEnv('VITE_MAX_IMAGEN_MB', '5')
    vi.stubEnv('VITE_UF_VALOR_CLP', '40000')
    
    const env = await import('../env')
    expect(env.API_BASE_URL).toBe('http://custom/api')
    expect(env.tieneGeminiConfigurada()).toBe(true)
    expect(env.MAX_IMAGEN_MB).toBe(5)
    expect(env.UF_VALOR_CLP_FALLBACK).toBe(40000)
  })
})
