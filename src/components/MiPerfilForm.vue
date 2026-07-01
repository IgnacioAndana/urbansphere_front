<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { authService, usuariosService } from '../services/usuarios'
import CampoContrasena from './CampoContrasena.vue'
import { obtenerMensajeError } from '../utils/apiError'

const props = withDefaults(
  defineProps<{
    /** Recargar datos al abrir (modal) */
    activo?: boolean
    mostrarCancelar?: boolean
  }>(),
  { activo: true, mostrarCancelar: false },
)

const emit = defineEmits<{
  actualizado: []
  cancelar: []
}>()

const nombre = ref('')
const email = ref('')
const contrasena = ref('')
const contrasenaConfirm = ref('')
const guardando = ref(false)
const errorMsg = ref('')
const exitoMsg = ref('')

async function cargarPerfil() {
  errorMsg.value = ''
  exitoMsg.value = ''
  contrasena.value = ''
  contrasenaConfirm.value = ''

  try {
    const perfil = await authService.obtenerPerfil()
    nombre.value = perfil.nombre
    email.value = perfil.email
  } catch {
    const local = authService.obtenerUsuarioLocal()
    nombre.value = local?.nombre ?? ''
    email.value = local?.email ?? ''
  }
}

onMounted(() => {
  if (props.activo) cargarPerfil()
})

watch(
  () => props.activo,
  (activo) => {
    if (activo) cargarPerfil()
  },
)

const guardar = async () => {
  errorMsg.value = ''
  exitoMsg.value = ''

  if (contrasena.value || contrasenaConfirm.value) {
    if (!contrasena.value || !contrasenaConfirm.value) {
      errorMsg.value = 'Debes completar ambos campos de contraseña.'
      return
    }
    if (contrasena.value !== contrasenaConfirm.value) {
      errorMsg.value = 'Las contraseñas no coinciden.'
      return
    }
  }

  guardando.value = true
  try {
    await usuariosService.actualizarMiPerfil({
      nombre: nombre.value.trim(),
      email: email.value.trim(),
      ...(contrasena.value ? { contrasena: contrasena.value } : {}),
    })
    await authService.obtenerPerfil()
    exitoMsg.value = 'Datos actualizados correctamente.'
    emit('actualizado')
    if (props.mostrarCancelar) {
      setTimeout(() => {
        if (exitoMsg.value) emit('cancelar')
      }, 900)
    }
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo actualizar el perfil.')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="guardar">
    <p v-if="!mostrarCancelar" class="text-sm text-slate-500">
      Actualiza tu nombre, correo o contraseña.
    </p>
    <p v-else class="text-xs text-slate-500">
      Actualiza tu nombre, correo o contraseña.
    </p>

    <div v-if="errorMsg" role="alert" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
      {{ errorMsg }}
    </div>
    <div v-if="exitoMsg" class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
      {{ exitoMsg }}
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
      <input
        v-model="nombre"
        type="text"
        required
        class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399]"
      />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Correo</label>
      <input
        v-model="email"
        type="email"
        required
        class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399]"
      />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nueva contraseña (opcional)</label>
      <CampoContrasena v-model="contrasena" autocomplete="new-password" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmar contraseña</label>
      <CampoContrasena v-model="contrasenaConfirm" autocomplete="new-password" />
    </div>

    <div class="flex flex-col sm:flex-row gap-2 pt-2">
      <button
        v-if="mostrarCancelar"
        type="button"
        class="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
        @click="emit('cancelar')"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="guardando"
        class="flex-1 bg-[#003399] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50"
        :class="{ 'sm:max-w-xs sm:ml-auto': !mostrarCancelar }"
      >
        {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </div>
  </form>
</template>
