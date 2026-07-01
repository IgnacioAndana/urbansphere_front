<script setup lang="ts">
import { ref, watch } from 'vue'
import { authService, usuariosService } from '../services/usuarios'
import { obtenerMensajeError } from '../utils/apiError'

const props = defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  cerrar: []
  actualizado: []
}>()

const nombre = ref('')
const email = ref('')
const contrasena = ref('')
const contrasenaConfirm = ref('')
const guardando = ref(false)
const errorMsg = ref('')
const exitoMsg = ref('')

watch(
  () => props.abierto,
  async (abierto) => {
    if (!abierto) return
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
  },
)

const cerrar = () => emit('cerrar')

const guardar = async () => {
  errorMsg.value = ''
  exitoMsg.value = ''

  const id = authService.obtenerUsuarioIdLocal()
  if (!id) {
    errorMsg.value = 'No hay sesión activa.'
    return
  }

  if (contrasena.value && contrasena.value !== contrasenaConfirm.value) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }

  guardando.value = true
  try {
    await usuariosService.actualizarPerfilPropio(id, {
      nombre: nombre.value.trim(),
      email: email.value.trim(),
      ...(contrasena.value ? { contrasena: contrasena.value } : {}),
    })
    await authService.obtenerPerfil()
    exitoMsg.value = 'Datos actualizados correctamente.'
    emit('actualizado')
    setTimeout(() => {
      if (exitoMsg.value) cerrar()
    }, 900)
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo actualizar el perfil.')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="abierto"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
      @click.self="cerrar"
    >
      <div
        role="dialog"
        aria-labelledby="mi-perfil-titulo"
        class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 id="mi-perfil-titulo" class="text-lg font-black text-slate-900">Mi perfil</h2>
          <button type="button" class="text-slate-400 hover:text-slate-600 text-xl leading-none" @click="cerrar">×</button>
        </div>

        <form class="p-6 flex flex-col gap-4" @submit.prevent="guardar">
          <p class="text-xs text-slate-500">Actualiza tu nombre, correo o contraseña.</p>

          <div v-if="errorMsg" role="alert" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
            {{ errorMsg }}
          </div>
          <div v-if="exitoMsg" class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            {{ exitoMsg }}
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
            <input v-model="nombre" type="text" required class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399]" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Correo</label>
            <input v-model="email" type="email" required class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399]" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nueva contraseña (opcional)</label>
            <input v-model="contrasena" type="password" autocomplete="new-password" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399]" />
          </div>

          <div v-if="contrasena">
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmar contraseña</label>
            <input v-model="contrasenaConfirm" type="password" autocomplete="new-password" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399]" />
          </div>

          <div class="flex gap-2 pt-2">
            <button type="button" class="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50" @click="cerrar">
              Cancelar
            </button>
            <button type="submit" :disabled="guardando" class="flex-1 bg-[#003399] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
