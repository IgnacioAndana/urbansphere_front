import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { proyectosService } from '../services/proyectos'
import type { CrearProyectoDto, TipoProyecto } from '../types/proyectos'
import { obtenerMensajeError } from '../utils/apiError'
import { GEMINI_API_KEY, GEMINI_MODEL, tieneGeminiConfigurada } from '../config/env'
import { validarFechaEntrega } from '../utils/validacionesProyecto'
import { normalizarTipoProyecto } from '../utils/catalogoProyecto'

export function useProyectoForm() {
  const route = useRoute()
  const router = useRouter()

  const esEdicion = computed(() => route.name === 'admin-proyecto-editar')
  const proyectoId = computed(() => {
    if (!esEdicion.value) return null
    const id = Number(route.params.proyectoId)
    return Number.isNaN(id) ? null : id
  })

  const titulo = ref('')
  const direccion = ref('')
  const comuna = ref('')
  const tipo = ref<TipoProyecto>('departamento')
  const fechaEntregaEstimada = ref('')
  const estado = ref('borrador')
  const latitud = ref(-33.4489)
  const longitud = ref(-70.6693)
  const descripcion = ref('')

  const cargando = ref(route.name === 'admin-proyecto-editar')
  const guardando = ref(false)
  const errorMsg = ref('')
  const avisoIa = ref('')
  const generandoIa = ref(false)
  const geminiDisponible = tieneGeminiConfigurada()

  async function cargarProyecto() {
    if (!proyectoId.value) return
    cargando.value = true
    errorMsg.value = ''
    try {
      const p = await proyectosService.obtenerPorId(proyectoId.value)
      titulo.value = p.titulo
      direccion.value = p.direccion
      comuna.value = p.comuna
      tipo.value = normalizarTipoProyecto(p.tipo)
      fechaEntregaEstimada.value = p.fechaEntregaEstimada?.slice(0, 10) ?? ''
      estado.value = p.estado
      latitud.value = p.latitud
      longitud.value = p.longitud
      descripcion.value = p.descripcion
    } catch (error) {
      errorMsg.value = obtenerMensajeError(error, 'No se pudo cargar el proyecto.')
    } finally {
      cargando.value = false
    }
  }

  watch(
    () => [route.name, route.params.proyectoId] as const,
    ([name]) => {
      if (name === 'admin-proyecto-editar') cargarProyecto()
    },
    { immediate: true },
  )

  function generarDescripcionSimulada(): string {
    let texto = `Descubre ${titulo.value.trim()}, un proyecto residencial en ${comuna.value.trim()}. `
    texto += 'Diseñado con terminaciones de calidad y espacios pensados para el confort de tu familia.'
    if (direccion.value.trim()) texto += ` Ubicado en ${direccion.value.trim()}.`
    texto += ' Contáctanos para conocer disponibilidad y condiciones de reserva.'
    return texto
  }

  async function redactarConIa() {
    avisoIa.value = ''
    if (!titulo.value.trim()) {
      avisoIa.value = 'Completa el título antes de generar la descripción.'
      return
    }
    if (!comuna.value.trim()) {
      avisoIa.value = 'Completa la comuna para mejor contexto.'
      return
    }

    if (!geminiDisponible) {
      generandoIa.value = true
      await new Promise((r) => setTimeout(r, 600))
      descripcion.value = generarDescripcionSimulada()
      avisoIa.value = 'Modo demo: texto de ejemplo generado. Configura VITE_GEMINI_API_KEY para usar Gemini.'
      generandoIa.value = false
      return
    }

    generandoIa.value = true
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
      let prompt = `Redacta una descripción comercial atractiva (2-3 párrafos cortos) para un proyecto inmobiliario en Chile.\n`
      prompt += `Título: ${titulo.value.trim()}\nComuna: ${comuna.value.trim()}`
      if (direccion.value.trim()) prompt += `\nDirección: ${direccion.value.trim()}`
      prompt += `\nSolo el texto comercial, sin saludos.`
      const result = await model.generateContent(prompt)
      descripcion.value = result.response.text().trim()
      avisoIa.value = 'Descripción generada con Gemini. Revísala antes de guardar.'
    } catch (error) {
      avisoIa.value = obtenerMensajeError(error, 'Error al contactar Gemini.')
    } finally {
      generandoIa.value = false
    }
  }

  function validar(): string | null {
    if (!titulo.value.trim()) return 'El título es obligatorio.'
    if (!direccion.value.trim()) return 'La dirección es obligatoria.'
    if (!comuna.value.trim()) return 'La comuna es obligatoria.'
    if (!tipo.value) return 'El tipo de propiedad es obligatorio.'
    if (!descripcion.value.trim()) return 'La descripción es obligatoria.'
    const errFecha = validarFechaEntrega(fechaEntregaEstimada.value)
    if (errFecha) return errFecha
    return null
  }

  function dto(): CrearProyectoDto {
    return {
      titulo: titulo.value.trim(),
      direccion: direccion.value.trim(),
      comuna: comuna.value.trim(),
      tipo: tipo.value,
      fechaEntregaEstimada: fechaEntregaEstimada.value || undefined,
      latitud: latitud.value,
      longitud: longitud.value,
      descripcion: descripcion.value.trim(),
      estado: estado.value,
    }
  }

  async function guardar() {
    const err = validar()
    if (err) {
      errorMsg.value = err
      return
    }

    guardando.value = true
    errorMsg.value = ''
    try {
      if (esEdicion.value && proyectoId.value) {
        await proyectosService.actualizar(proyectoId.value, dto())
        avisoIa.value = 'Proyecto actualizado correctamente.'
      } else {
        const nuevo = await proyectosService.crear(dto())
        await router.push({
          name: 'admin-proyecto-tipologias',
          params: { proyectoId: nuevo.id },
          query: { creado: '1' },
        })
      }
    } catch (error) {
      errorMsg.value = obtenerMensajeError(error, 'No se pudo guardar el proyecto.')
    } finally {
      guardando.value = false
    }
  }

  return {
    esEdicion,
    proyectoId,
    titulo,
    direccion,
    comuna,
    tipo,
    fechaEntregaEstimada,
    estado,
    latitud,
    longitud,
    descripcion,
    cargando,
    guardando,
    errorMsg,
    avisoIa,
    generandoIa,
    geminiDisponible,
    redactarConIa,
    guardar,
    cargarProyecto,
  }
}
