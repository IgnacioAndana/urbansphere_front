<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../services/usuarios'
import { obtenerMensajeError } from '../utils/apiError'
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png'

const route = useRoute()
const router = useRouter()

const token = ref('')
const contrasena = ref('')
const contrasenaConfirm = ref('')
const validando = ref(true)
const tokenValido = ref(false)
const cargando = ref(false)
const errorMsg = ref('')
const listo = ref(false)

onMounted(async () => {
  token.value = String(route.query.token ?? '')
  if (!token.value) {
    validando.value = false
    errorMsg.value = 'El enlace no es válido o está incompleto.'
    return
  }

  try {
    await authService.validarTokenRestablecimiento({ token: token.value })
    tokenValido.value = true
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'El enlace expiró o ya fue utilizado.')
  } finally {
    validando.value = false
  }
})

const restablecer = async () => {
  if (contrasena.value !== contrasenaConfirm.value) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }

  cargando.value = true
  errorMsg.value = ''
  try {
    await authService.restablecerContrasena({ token: token.value, contrasena: contrasena.value })
    listo.value = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo restablecer la contraseña.')
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
        <h1 class="text-2xl font-black text-slate-900">Nueva contraseña</h1>
      </div>

      <p v-if="validando" class="text-sm text-slate-500 text-center">Validando enlace...</p>

      <div v-if="listo" class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
        Contraseña actualizada. Redirigiendo al login...
      </div>

      <div v-if="errorMsg && !listo" role="alert" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
        {{ errorMsg }}
      </div>

      <form v-if="tokenValido && !listo" class="flex flex-col gap-4" @submit.prevent="restablecer">
        <div>
          <label class="block text-sm font-bold text-slate-900 mb-2">Nueva contraseña</label>
          <input v-model="contrasena" type="password" required minlength="8" class="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003399]" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-900 mb-2">Confirmar contraseña</label>
          <input v-model="contrasenaConfirm" type="password" required class="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003399]" />
        </div>
        <button type="submit" :disabled="cargando" class="w-full bg-[#003399] text-white py-3 rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50">
          {{ cargando ? 'Guardando...' : 'Restablecer contraseña' }}
        </button>
      </form>

      <router-link v-if="!listo" to="/login" class="text-center text-sm font-bold text-[#003399] hover:underline">
        ← Volver al login
      </router-link>
    </div>
  </div>
</template>
