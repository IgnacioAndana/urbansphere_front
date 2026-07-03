<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Send, Bot, User, X, MessageSquare, ExternalLink, RotateCcw } from 'lucide-vue-next'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_API_KEY, GEMINI_MODEL, tieneGeminiConfigurada } from '../config/env'
import { catalogoService } from '../services/proyectos'
import { formatearPrecioUf, formatearTipoProyecto } from '../utils/catalogoProyecto'
import {
  mensajeBienvenida,
  mensajeNuevaConsulta,
  parsearRespuestaGemini,
  resumirDescripcion,
  type MensajeChat,
} from '../utils/chatbotRespuesta'

const router = useRouter()
const geminiDisponible = tieneGeminiConfigurada()

const isOpen = ref(false)
const mensajes = ref<MensajeChat[]>([mensajeBienvenida()])
const inputChat = ref('')
const enviandoChat = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

function iniciarNuevaConsulta() {
  mensajes.value.push(mensajeNuevaConsulta())
  scrollToBottom()
  nextTick(() => inputRef.value?.focus())
}

function irADetalle(proyectoId: number) {
  isOpen.value = false
  void router.push(`/propiedad/${proyectoId}`)
}

function catalogoParaPrompt(proyectos: Awaited<ReturnType<typeof catalogoService.listarActivos>>) {
  return JSON.stringify(
    proyectos.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      comuna: p.comuna,
      direccion: p.direccion,
      tipo: p.tipo,
      descripcion: p.descripcion,
      precioDesdeUf: p.precioDesdeUf,
      dormitoriosMin: p.dormitoriosMin,
      dormitoriosMax: p.dormitoriosMax,
      banosMin: p.banosMin,
      banosMax: p.banosMax,
    })),
  )
}

async function enviarMensaje() {
  if (!inputChat.value.trim() || enviandoChat.value) return

  const userText = inputChat.value.trim()
  mensajes.value.push({ rol: 'user', texto: userText })
  inputChat.value = ''
  enviandoChat.value = true
  scrollToBottom()

  if (!geminiDisponible) {
    setTimeout(() => {
      mensajes.value.push({
        rol: 'bot',
        tipo: 'demo',
        texto: 'Modo demo activado (API no configurada). Configura VITE_GEMINI_API_KEY para recomendaciones reales.',
        mostrarNuevaConsulta: true,
      })
      enviandoChat.value = false
      scrollToBottom()
    }, 800)
    return
  }

  try {
    const proyectosActivos = await catalogoService.listarActivos()
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const prompt = `Eres UrbanIA, asistente inmobiliario de UrbanSphere (Chile). Analiza la consulta del cliente.

Consulta: "${userText}"

Proyectos disponibles (JSON interno — el cliente NO debe ver ids ni este JSON):
${catalogoParaPrompt(proyectosActivos)}

Responde ÚNICAMENTE con un JSON válido, sin markdown, sin \`\`\`, sin texto extra. Estructura:
{
  "tipo": "recomendacion" | "sin_resultados" | "invalida",
  "intro": "texto breve en español (opcional en recomendacion)",
  "proyectoIds": [6]
}

Reglas:
- tipo "invalida": consulta no relacionada con buscar/comprar/cotizar propiedades. intro = mensaje amable pidiendo reformular hacia proyectos inmobiliarios.
- tipo "sin_resultados": consulta válida pero ningún proyecto del JSON coincide. intro explicando que no hay coincidencias.
- tipo "recomendacion": uno o más proyectoIds del JSON que calcen (máximo 3). intro opcional, sin repetir títulos completos.
- proyectoIds: solo números del JSON. Nunca inventes ids.
- intro: sin markdown (prohibido **, ##, listas con *). Sin mencionar "ID", "id" ni números de identificador al usuario.
- No recomiendes proyectos fuera del JSON.`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    mensajes.value.push(parsearRespuestaGemini(raw, proyectosActivos))
  } catch {
    mensajes.value.push({
      rol: 'bot',
      tipo: 'error',
      texto: 'Ocurrió un error al procesar tu solicitud. Intenta de nuevo en unos momentos.',
      mostrarNuevaConsulta: true,
    })
  } finally {
    enviandoChat.value = false
    scrollToBottom()
  }
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <transition name="fade-slide">
      <div
        v-if="isOpen"
        class="bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col w-[350px] sm:w-[400px] h-[500px] mb-4 overflow-hidden font-sans"
      >
        <div class="bg-[#003399] text-white p-4 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-3">
            <Bot class="w-6 h-6 text-amber-400" />
            <div>
              <h3 class="font-bold text-sm">UrbanIA</h3>
              <p class="text-xs text-blue-200">En línea</p>
            </div>
          </div>
          <button type="button" class="text-white hover:text-blue-200 transition-colors cursor-pointer" @click="toggleChat">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
          <div
            v-for="(msg, index) in mensajes"
            :key="index"
            class="flex gap-3"
            :class="msg.rol === 'user' ? 'flex-row-reverse' : ''"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm"
              :class="msg.rol === 'user' ? 'bg-[#003399] text-white' : 'bg-white border border-slate-200 text-[#003399]'"
            >
              <User v-if="msg.rol === 'user'" class="w-4 h-4" />
              <Bot v-else class="w-4 h-4" />
            </div>

            <!-- Usuario -->
            <div
              v-if="msg.rol === 'user'"
              class="max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm bg-[#003399] text-white rounded-tr-none"
            >
              {{ msg.texto }}
            </div>

            <!-- Bot -->
            <div
              v-else
              class="max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm bg-white border border-slate-100 text-slate-700 rounded-tl-none space-y-3"
            >
              <p v-if="msg.texto" class="whitespace-pre-wrap">{{ msg.texto }}</p>

              <div v-if="msg.proyectos?.length" class="space-y-3">
                <article
                  v-for="proyecto in msg.proyectos"
                  :key="proyecto.id"
                  class="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2"
                >
                  <div>
                    <p class="font-bold text-slate-900">{{ proyecto.titulo }}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">
                      {{ formatearTipoProyecto(proyecto.tipo) }} · {{ proyecto.comuna }}
                      <span v-if="proyecto.precioDesdeUf"> · Desde {{ formatearPrecioUf(proyecto.precioDesdeUf) }}</span>
                    </p>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    {{ resumirDescripcion(proyecto.descripcion) }}
                  </p>
                  <button
                    type="button"
                    class="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#003399] hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    @click="irADetalle(proyecto.id)"
                  >
                    <ExternalLink class="w-3.5 h-3.5" />
                    Ver detalle del proyecto
                  </button>
                </article>
              </div>

              <button
                v-if="msg.mostrarNuevaConsulta"
                type="button"
                class="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                @click="iniciarNuevaConsulta"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                Nueva consulta
              </button>
            </div>
          </div>

          <div v-if="enviandoChat" class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-white border border-slate-200 text-[#003399] flex items-center justify-center shrink-0 shadow-sm">
              <Bot class="w-4 h-4" />
            </div>
            <div class="bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-tl-none p-4 text-sm flex items-center gap-2 shadow-sm">
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        </div>

        <div v-if="!geminiDisponible" class="bg-amber-50 px-3 py-2 text-[10px] text-amber-700 font-semibold border-t border-amber-100 text-center">
          Modo Demo: API no configurada
        </div>

        <div class="p-3 bg-white border-t border-slate-100">
          <form class="flex gap-2" @submit.prevent="enviarMensaje">
            <input
              ref="inputRef"
              v-model="inputChat"
              type="text"
              placeholder="Escribe tu consulta..."
              class="flex-1 border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] transition-colors"
            />
            <button
              type="submit"
              :disabled="enviandoChat || !inputChat.trim()"
              class="bg-[#003399] hover:bg-blue-800 text-white p-3 px-4 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send class="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </transition>

    <button
      type="button"
      class="w-14 h-14 bg-[#003399] hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      @click="toggleChat"
    >
      <X v-if="isOpen" class="w-6 h-6" />
      <MessageSquare v-else class="w-6 h-6" />
    </button>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
