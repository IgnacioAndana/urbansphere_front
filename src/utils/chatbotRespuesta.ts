import type { ProyectoCatalogoItem } from './catalogoProyecto'
import { aEnteroPositivoNullable } from './numeros'

export type TipoRespuestaChatbot = 'bienvenida' | 'recomendacion' | 'sin_resultados' | 'invalida' | 'nueva_consulta' | 'error' | 'demo'

export interface MensajeUsuario {
  rol: 'user'
  texto: string
}

export interface MensajeBot {
  rol: 'bot'
  tipo: TipoRespuestaChatbot
  texto?: string
  proyectos?: ProyectoCatalogoItem[]
  mostrarNuevaConsulta?: boolean
}

export type MensajeChat = MensajeUsuario | MensajeBot

interface RespuestaGeminiJson {
  tipo?: string
  intro?: string
  mensaje?: string
  proyectoIds?: unknown[]
}

const MENSAJE_INVALIDA =
  'Tu consulta no está relacionada con proyectos inmobiliarios. Por favor, reformula tu pregunta (por ejemplo: departamento en Viña del Mar).'

const MENSAJE_NUEVA_CONSULTA =
  '¿Cuál es tu nueva consulta? Cuéntame comuna, tipo de propiedad o lo que busques.'

export function mensajeBienvenida(): MensajeBot {
  return {
    rol: 'bot',
    tipo: 'bienvenida',
    texto:
      '¡Hola, soy UrbanIA, tu asistente virtual de UrbanSphere! Describe qué tipo de proyecto buscas (ej: departamento en Providencia) y te recomendaré opciones de nuestro catálogo.',
  }
}

export function mensajeNuevaConsulta(): MensajeBot {
  return {
    rol: 'bot',
    tipo: 'nueva_consulta',
    texto: MENSAJE_NUEVA_CONSULTA,
  }
}

export function limpiarTextoVisible(texto: string): string {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\(ID:\s*\d+\)/gi, '')
    .replace(/\(id:\s*\d+\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function extraerJson(raw: string): RespuestaGeminiJson | null {
  const limpio = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  try {
    return JSON.parse(limpio) as RespuestaGeminiJson
  } catch {
    const match = limpio.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0]) as RespuestaGeminiJson
    } catch {
      return null
    }
  }
}

function resolverProyectos(
  ids: unknown[] | undefined,
  catalogo: ProyectoCatalogoItem[],
): ProyectoCatalogoItem[] {
  if (!ids?.length) return []
  const porId = new Map(catalogo.map((p) => [p.id, p]))
  return ids
    .map((id) => aEnteroPositivoNullable(id))
    .filter((id): id is number => id != null)
    .map((id) => porId.get(id))
    .filter((p): p is ProyectoCatalogoItem => p != null)
}

export function parsearRespuestaGemini(
  raw: string,
  catalogo: ProyectoCatalogoItem[],
): MensajeBot {
  const parsed = extraerJson(raw)

  if (!parsed) {
    return {
      rol: 'bot',
      tipo: 'recomendacion',
      texto: limpiarTextoVisible(raw),
      mostrarNuevaConsulta: true,
    }
  }

  const tipo = String(parsed.tipo ?? '').toLowerCase()
  const intro = limpiarTextoVisible(parsed.intro ?? parsed.mensaje ?? '')

  if (tipo === 'invalida') {
    return {
      rol: 'bot',
      tipo: 'invalida',
      texto: intro || MENSAJE_INVALIDA,
      mostrarNuevaConsulta: true,
    }
  }

  if (tipo === 'sin_resultados') {
    return {
      rol: 'bot',
      tipo: 'sin_resultados',
      texto:
        intro ||
        'Por el momento no contamos con un proyecto que coincida con tu búsqueda. Prueba otra comuna o tipo de propiedad.',
      mostrarNuevaConsulta: true,
    }
  }

  const proyectos = resolverProyectos(parsed.proyectoIds, catalogo)

  if (!proyectos.length) {
    return {
      rol: 'bot',
      tipo: 'sin_resultados',
      texto:
        intro ||
        'No encontré proyectos que coincidan con tu consulta en nuestro catálogo actual.',
      mostrarNuevaConsulta: true,
    }
  }

  return {
    rol: 'bot',
    tipo: 'recomendacion',
    texto: intro || undefined,
    proyectos,
    mostrarNuevaConsulta: true,
  }
}

export function resumirDescripcion(texto: string, max = 280): string {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  if (limpio.length <= max) return limpio
  return `${limpio.slice(0, max).trim()}…`
}
