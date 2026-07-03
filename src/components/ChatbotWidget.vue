<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Send, Bot, User, X, MessageSquare } from 'lucide-vue-next'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_API_KEY, GEMINI_MODEL, tieneGeminiConfigurada } from '../config/env'
import { catalogoService } from '../services/proyectos'

const geminiDisponible = tieneGeminiConfigurada()

const isOpen = ref(false)

interface Mensaje {
  rol: 'user' | 'bot'
  texto: string
}

const mensajes = ref<Mensaje[]>([
  { rol: 'bot', texto: '¡Hola, soy UrbanIA tu asistente virtual de UrbanSphere! Describe qué tipo de proyecto estás buscando (ej: departamento en Providencia) y te recomendaré algo basándome en los proyectos disponibles.' }
])
const inputChat = ref('')
const enviandoChat = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
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
      mensajes.value.push({ rol: 'bot', texto: 'Modo demo activado (API no configurada). Te recomiendo el "Proyecto Vista Demo", ideal para lo que buscas.' })
      enviandoChat.value = false
      scrollToBottom()
    }, 1000)
    return
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
    
    const proyectosActivos = await catalogoService.listarActivos()
    const jsonProyectos = JSON.stringify(proyectosActivos.map(p => ({
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
    })))
    
    const prompt = `Eres un asistente inmobiliario virtual exclusivo del ecosistema UrbanSphere. Tu única función es orientar a los usuarios sobre proyectos inmobiliarios en Chile.

    Analiza de forma estricta la siguiente consulta del cliente: "${userText}"

    Sigue estas reglas de negocio de manera obligatoria:

    1. FILTRO DE VALIDEZ CRÍTICO: 
    - Si la consulta NO está relacionada con la búsqueda, compra, arriendo, cotización o características de proyectos inmobiliarios, debes responder EXACTAMENTE y únicamente con el siguiente mensaje, sin agregar nada más:
    "Tu consulta es inválida para este asistente. Por favor, vuelve a reformular tu pregunta orientándola a nuestros proyectos inmobiliarios."

    2. COMPORTAMIENTO PARA CONSULTAS VÁLIDAS:
    - Si y solo si la consulta es válida y atingente al rubro inmobiliario, consulta la siguiente lista de proyectos reales disponibles en nuestra base de datos en formato JSON:
    ${jsonProyectos}
    
    - Responde recomendando el o los proyectos que mejor calcen con la petición del cliente basándote estrictamente en la data proporcionada.
    - Si no hay proyectos que coincidan, indícale amablemente que por el momento no contamos con un proyecto de esas características.
    - Tu tono debe ser amable, breve y conciso (máximo 2 párrafos).
    - Solo responde en español.
    - Está estrictamente prohibido recomendar servicios, entidades o proyectos ajenos a UrbanSphere o inventar proyectos que no estén en el JSON.`

    const result = await model.generateContent(prompt)
    mensajes.value.push({ rol: 'bot', texto: result.response.text().trim() })
  } catch (error) {
    mensajes.value.push({ rol: 'bot', texto: 'Ocurrió un error al procesar tu solicitud, intenta más tarde.' })
  } finally {
    enviandoChat.value = false
    scrollToBottom()
  }
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    
    <!-- Ventana del Chat -->
    <transition name="fade-slide">
      <div v-if="isOpen" class="bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col w-[350px] sm:w-[400px] h-[500px] mb-4 overflow-hidden font-sans">
        
        <!-- Header -->
        <div class="bg-[#003399] text-white p-4 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-3">
            <Bot class="w-6 h-6 text-amber-400" />
            <div>
              <h3 class="font-bold text-sm">UrbanIA</h3>
              <p class="text-xs text-blue-200">En línea</p>
            </div>
          </div>
          <button @click="toggleChat" class="text-white hover:text-blue-200 transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body / Mensajes -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
          <div v-for="(msg, index) in mensajes" :key="index" class="flex gap-3" :class="msg.rol === 'user' ? 'flex-row-reverse' : ''">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" :class="msg.rol === 'user' ? 'bg-[#003399] text-white' : 'bg-white border border-slate-200 text-[#003399]'">
              <User v-if="msg.rol === 'user'" class="w-4 h-4" />
              <Bot v-else class="w-4 h-4" />
            </div>
            <div class="max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm" :class="msg.rol === 'user' ? 'bg-[#003399] text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'">
              {{ msg.texto }}
            </div>
          </div>
          <div v-if="enviandoChat" class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-white border border-slate-200 text-[#003399] flex items-center justify-center shrink-0 shadow-sm">
              <Bot class="w-4 h-4" />
            </div>
            <div class="bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-tl-none p-4 text-sm flex items-center gap-2 shadow-sm">
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
              <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        </div>

        <!-- Alerta API Demo -->
        <div v-if="!geminiDisponible" class="bg-amber-50 px-3 py-2 text-[10px] text-amber-700 font-semibold border-t border-amber-100 text-center">
          Modo Demo: API no configurada
        </div>

        <!-- Input -->
        <div class="p-3 bg-white border-t border-slate-100">
          <form @submit.prevent="enviarMensaje" class="flex gap-2">
            <input
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

    <!-- Botón Flotante -->
    <button
      @click="toggleChat"
      class="w-14 h-14 bg-[#003399] hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
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

/* Transición para el chat */
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
