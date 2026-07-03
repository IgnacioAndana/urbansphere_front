<script setup lang="ts">
import { ref } from 'vue'
import { Send, MessageSquare, User, Mail, MapPin } from 'lucide-vue-next'
import PublicLayout from '../layouts/PublicLayout.vue'
import { solicitudesContactoService } from '../services/usuarios'
import { obtenerMensajeError } from '../utils/apiError'

const enviando = ref(false)
const formularioEnviado = ref(false)
const errorMsg = ref('')

const form = ref({
  nombreCompleto: '',
  email: '',
  mensaje: '',
})

async function enviarFormulario() {
  enviando.value = true
  errorMsg.value = ''
  try {
    await solicitudesContactoService.enviar({
      nombreCompleto: form.value.nombreCompleto.trim(),
      email: form.value.email.trim(),
      mensaje: form.value.mensaje.trim(),
    })
    formularioEnviado.value = true
    form.value = { nombreCompleto: '', email: '', mensaje: '' }
    setTimeout(() => {
      formularioEnviado.value = false
    }, 5000)
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo enviar la solicitud.')
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <PublicLayout>
    <div class="min-h-[calc(100vh-75px)] bg-slate-50 flex items-center py-12 px-4">
      <div class="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span class="text-[#003399] font-black tracking-widest uppercase text-xs mb-3 block">Contacto Directo</span>
          <h1 class="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
            ¿Encontraste la propiedad de tus sueños?
          </h1>
          <p class="text-lg text-slate-500 mb-8 leading-relaxed">
            Cuéntanos qué propiedad te interesa o qué dudas tienes. Un agente de UrbanSphere revisará tu mensaje y se pondrá en contacto contigo a la brevedad.
          </p>

          <div class="flex flex-col gap-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-200">
                <MapPin class="w-6 h-6 text-[#003399]" />
              </div>
              <div>
                <h4 class="font-bold text-slate-900">Oficina Central</h4>
                <p class="text-slate-500 text-sm mt-1">Av. Apoquindo 4501, Las Condes<br>Santiago, Chile.</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-200">
                <Mail class="w-6 h-6 text-[#003399]" />
              </div>
              <div>
                <h4 class="font-bold text-slate-900">Correo Electrónico</h4>
                <p class="text-slate-500 text-sm mt-1">contacto@urbansphere.cl<br>soporte@urbansphere.cl</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          <div
            v-if="formularioEnviado"
            class="absolute inset-0 bg-[#003399] flex flex-col items-center justify-center text-white p-8 text-center z-10"
          >
            <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <Send class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-3xl font-black mb-2">¡Solicitud Enviada!</h3>
            <p class="text-blue-100 text-lg">Recibimos tu mensaje. Un agente se comunicará contigo pronto.</p>
          </div>

          <h2 class="text-2xl font-black text-slate-900 mb-6">Formulario de consulta</h2>

          <div v-if="errorMsg" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
            {{ errorMsg }}
          </div>

          <form class="flex flex-col gap-5" @submit.prevent="enviarFormulario">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Nombre completo</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User class="w-5 h-5" /></span>
                <input
                  v-model="form.nombreCompleto"
                  type="text"
                  placeholder="Ej: Ana María Silva"
                  required
                  class="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399]"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Correo electrónico</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail class="w-5 h-5" /></span>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  required
                  class="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399]"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Mensaje</label>
              <div class="relative">
                <span class="absolute top-3 left-0 flex items-start pl-3 text-slate-400"><MessageSquare class="w-5 h-5" /></span>
                <textarea
                  v-model="form.mensaje"
                  rows="4"
                  placeholder="Indícanos qué necesitas y un agente se contactará contigo."
                  required
                  class="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399] resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              :disabled="enviando"
              class="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold hover:bg-[#003399] transition-all shadow-md mt-2 flex items-center justify-center cursor-pointer disabled:opacity-70"
            >
              <span v-if="enviando" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span v-else class="flex items-center gap-2"><Send class="w-5 h-5" /> Enviar Solicitud</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
