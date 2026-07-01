<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '../services/usuarios'
import { obtenerMensajeError } from '../utils/apiError'
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png'

const email = ref('')
const cargando = ref(false)
const errorMsg = ref('')
const enviado = ref(false)
const mensajeExito = ref('')

const enviar = async () => {
  cargando.value = true
  errorMsg.value = ''
  try {
    const resp = await authService.solicitarRestablecimiento({ email: email.value.trim() })
    enviado.value = true
    mensajeExito.value = resp.mensaje || 'Revisa tu correo para restablecer la contraseña.'
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo procesar la solicitud.')
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-6">
    <div class="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col gap-6">
      <div class="flex flex-col items-center gap-2">
        <img :src="isotipoUrl" alt="UrbanSphere" class="h-24 object-contain" />
        <h1 class="text-2xl font-black text-slate-900">Recuperar contraseña</h1>
        <p class="text-sm text-slate-500 text-center">Te enviaremos un enlace de un solo uso si el correo está registrado.</p>
      </div>

      <div v-if="enviado" class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        {{ mensajeExito }}
      </div>

      <div v-if="errorMsg" role="alert" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
        {{ errorMsg }}
      </div>

      <form v-if="!enviado" class="flex flex-col gap-4" @submit.prevent="enviar">
        <div>
          <label class="block text-sm font-bold text-slate-900 mb-2">Correo electrónico</label>
          <input v-model="email" type="email" required placeholder="tu@correo.com" class="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003399]" />
        </div>
        <button type="submit" :disabled="cargando" class="w-full bg-[#003399] text-white py-3 rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50">
          {{ cargando ? 'Enviando...' : 'Enviar enlace' }}
        </button>
      </form>

      <router-link to="/login" class="text-center text-sm font-bold text-[#003399] hover:underline">
        ← Volver al inicio de sesión
      </router-link>
    </div>
  </div>
</template>
