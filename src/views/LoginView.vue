<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Mail, ArrowLeft } from 'lucide-vue-next'
import CampoContrasena from '../components/CampoContrasena.vue'
import { authService } from '../services/usuarios'
import { MENSAJE_SESION_EXPIRADA, obtenerMensajeErrorLogin } from '../utils/apiError'
import { redirigirTrasLogin, rutaSiYaAutenticado, parseReturnTo } from '../utils/authRedirect'
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png'

const router = useRouter()
const route = useRoute()

const email = ref('')
const contrasena = ref('')
const cargando = ref(false)
const errorMsg = ref('')
const avisoSesion = ref('')

const volverDestino = computed(() => parseReturnTo(route.query.returnTo) ?? '/')

onMounted(() => {
  if (route.query.sesionExpirada === '1') {
    avisoSesion.value = MENSAJE_SESION_EXPIRADA
  }

  const destino = rutaSiYaAutenticado()
  if (destino) router.replace(destino)
})

const manejarLogin = async () => {
  cargando.value = true
  errorMsg.value = ''

  try {
    await authService.iniciarSesion({
      email: email.value,
      contrasena: contrasena.value,
    })
    await redirigirTrasLogin(router, route.query.returnTo)
  } catch (error) {
    errorMsg.value = obtenerMensajeErrorLogin(error)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-white">
    
    <!-- LADO IZQUIERDO: Imagen (Visible solo en PC) -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-100 flex-col justify-center p-12 overflow-hidden border-r border-slate-200">
      <div class="absolute inset-0 bg-slate-200 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-90"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent"></div>
      
      <div class="relative z-10 mt-auto">
        <h1 class="text-5xl font-black text-[#0f172a] tracking-tight">Urban<span class="text-[#003399]">Sphere</span></h1>
        <p class="text-xl text-slate-700 mt-2 font-medium">Inteligencia Inmobiliaria</p>
        <div class="w-12 h-1 bg-[#003399] mt-4"></div>
      </div>
    </div>

    <!-- LADO DERECHO: Formulario de Login -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
      <div class="w-full max-w-md flex flex-col gap-8">
        
        <div class="flex flex-col items-center mb-4">
          <img :src="isotipoUrl" alt="UrbanSphere Isotipo" class="h-40 object-contain mb-2" />
          <h2 class="text-3xl font-black text-slate-900">Inicia sesión</h2>
          <p class="text-slate-500 mt-2 text-sm">Accede a tu cuenta para continuar en UrbanSphere.</p>
        </div>

        <div
          v-if="avisoSesion"
          role="status"
          class="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm font-medium"
        >
          {{ avisoSesion }}
        </div>

        <div
          v-if="errorMsg"
          role="alert"
          class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium"
        >
          {{ errorMsg }}
        </div>

        <form @submit.prevent="manejarLogin" class="flex flex-col gap-5">
          <div>
            <label class="block text-sm font-bold text-slate-900 mb-2">Correo electrónico</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail class="w-5 h-5" />
              </span>
              <input v-model="email" type="email" placeholder="ejemplo@correo.com" class="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399] transition-colors" required />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-bold text-slate-900 mb-2">Contraseña</label>
            <CampoContrasena
              v-model="contrasena"
              placeholder="Ingresa tu contraseña"
              required
              autocomplete="current-password"
            />
          </div>

          <div class="flex justify-end text-sm">
            <router-link to="/olvide-contrasena" class="text-[#003399] font-semibold hover:underline">¿Olvidaste tu contraseña?</router-link>
          </div>

          <button type="submit" :disabled="cargando" class="w-full bg-[#003399] text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors mt-2 cursor-pointer disabled:opacity-50">
            {{ cargando ? 'Autenticando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="text-center flex flex-col gap-3">
          <router-link to="/registro" class="text-sm font-bold text-slate-600 hover:text-[#003399] transition-colors">
            ¿No tienes cuenta? Regístrate aquí
          </router-link>
          <router-link :to="volverDestino" class="text-sm font-bold text-slate-400 hover:text-[#003399] transition-colors flex items-center justify-center gap-1">
            <ArrowLeft class="w-4 h-4" /> Volver
          </router-link>
        </div>

      </div>
    </div>

  </div>
</template>
