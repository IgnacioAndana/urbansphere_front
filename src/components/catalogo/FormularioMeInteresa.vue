<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Heart, LogIn } from 'lucide-vue-next'
import {
  authService,
  solicitudesInteresService,
  solicitudesContactoService,
} from '../../services/usuarios'
import { esUsuarioEstandar } from '../../constants/roles'
import { obtenerMensajeError } from '../../utils/apiError'
import { mensajeInteresDefault } from '../../utils/catalogoProyecto'
import { queryLoginDesde } from '../../utils/authRedirect'
import { aEnteroPositivo } from '../../utils/numeros'

const props = defineProps<{
  proyectoId: number | string
  tituloProyecto: string
}>()

const proyectoIdNumerico = computed(() => aEnteroPositivo(props.proyectoId))

const route = useRoute()

const nombre = ref('')
const email = ref('')
const mensaje = ref('')
const enviando = ref(false)
const exito = ref(false)
const errorMsg = ref('')

const autenticado = computed(() => authService.estaAutenticado())
const esUsuarioBasico = computed(() => esUsuarioEstandar(authService.obtenerRolIdLocal()))
const mostrarFormulario = computed(() => autenticado.value && esUsuarioBasico.value)
const mostrarLogin = computed(() => !autenticado.value)

const loginUrl = computed(() => ({
  path: '/login',
  query: queryLoginDesde(route.path, route.fullPath),
}))

function precargarDatos() {
  mensaje.value = mensajeInteresDefault(props.tituloProyecto)
  if (!autenticado.value) return
  const local = authService.obtenerUsuarioLocal()
  nombre.value = local?.nombre ?? ''
  email.value = local?.email ?? authService.obtenerEmailLocal() ?? ''
}

onMounted(precargarDatos)
watch(() => props.tituloProyecto, precargarDatos)

async function enviar() {
  errorMsg.value = ''
  enviando.value = true
  try {
    await solicitudesInteresService.enviar({
      proyectoId: proyectoIdNumerico.value,
      nombre: nombre.value.trim(),
      email: email.value.trim(),
    })

    const texto = mensaje.value.trim()
    if (texto) {
      await solicitudesContactoService.enviar({
        nombreCompleto: nombre.value.trim(),
        email: email.value.trim(),
        mensaje: `Consulta sobre proyecto "${props.tituloProyecto}" (ID ${proyectoIdNumerico.value}):\n\n${texto}`,
      })
    }

    exito.value = true
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo enviar tu solicitud.')
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div v-if="mostrarFormulario" class="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl sticky top-28">
    <h3 class="text-xl font-black text-slate-900 leading-tight mb-1">Me interesa este proyecto</h3>
    <p class="text-xs text-slate-500 mb-6">Un agente de UrbanSphere revisará tu solicitud y te contactará.</p>

    <div v-if="exito" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm">
      ¡Solicitud enviada! Revisa tu correo; pronto te contactaremos.
    </div>

    <form v-else class="flex flex-col gap-4" @submit.prevent="enviar">
      <div v-if="errorMsg" class="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
        {{ errorMsg }}
      </div>

      <div>
        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre completo *</label>
        <input
          v-model="nombre"
          type="text"
          required
          class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] bg-slate-50 focus:bg-white"
        />
      </div>
      <div>
        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Correo electrónico *</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] bg-slate-50 focus:bg-white"
        />
      </div>
      <div>
        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mensaje</label>
        <textarea
          v-model="mensaje"
          rows="4"
          class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] bg-slate-50 focus:bg-white resize-none"
        />
      </div>
      <button
        type="submit"
        :disabled="enviando"
        class="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold hover:bg-[#003399] transition-all shadow-md disabled:opacity-60"
      >
        {{ enviando ? 'Enviando...' : 'Solicitar información' }}
      </button>
    </form>
  </div>

  <div
    v-else-if="mostrarLogin"
    class="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl sticky top-28 text-center"
  >
    <div class="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
      <Heart class="w-7 h-7 text-[#003399]" />
    </div>
    <h3 class="text-xl font-black text-slate-900 mb-2">¿Te interesa este proyecto?</h3>
    <p class="text-sm text-slate-500 mb-6">
      Inicia sesión con tu cuenta de usuario para solicitar más información sobre esta propiedad.
    </p>
    <router-link
      :to="loginUrl"
      class="inline-flex items-center justify-center gap-2 w-full bg-[#003399] text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors"
    >
      <LogIn class="w-5 h-5" /> Iniciar sesión
    </router-link>
  </div>
</template>
