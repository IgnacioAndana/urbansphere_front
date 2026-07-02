<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import CampoContrasena from '../components/CampoContrasena.vue';
import { usuariosService } from '../services/usuarios';
import type { RegistrarUsuarioDto } from '../types/usuarios';
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png';

const router = useRouter();

const nombre = ref('');
const email = ref('');
const contrasena = ref('');
const confirmarContrasena = ref('');

const cargando = ref(false);
const errorMsg = ref('');
const exitoMsg = ref('');

const manejarRegistro = async () => {
  cargando.value = true;
  errorMsg.value = '';
  exitoMsg.value = '';
  
  try {
    if (contrasena.value !== confirmarContrasena.value) {
      errorMsg.value = 'Las contraseñas no coinciden.';
      cargando.value = false;
      return;
    }

    const data: RegistrarUsuarioDto = {
      nombre: nombre.value,
      email: email.value,
      contrasena: contrasena.value
    };
    
    await usuariosService.registrarPublico(data);
    exitoMsg.value = '¡Usuario registrado con éxito! Redirigiendo al login...';
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);
    
  } catch (error: any) {
    if (error.response) {
      errorMsg.value = error.response.data?.message || 'Error al registrar el usuario.';
    } else {
      errorMsg.value = 'El servidor no respondió. Verifica tu conexión.';
    }
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen bg-white">
    
    <!-- LADO IZQUIERDO: Imagen (Visible solo en PC) -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-100 flex-col justify-center p-12 overflow-hidden border-r border-slate-200">
      <div class="absolute inset-0 bg-slate-200 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-90"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent"></div>
      
      <div class="relative z-10 mt-auto">
        <h1 class="text-5xl font-black text-[#0f172a] tracking-tight">Únete a <br/><span class="text-[#003399]">UrbanSphere</span></h1>
        <p class="text-xl text-slate-700 mt-2 font-medium">Revolucionando el mercado inmobiliario</p>
        <div class="w-12 h-1 bg-[#003399] mt-4"></div>
      </div>
    </div>

    <!-- LADO DERECHO: Formulario de Registro -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
      <div class="w-full max-w-md flex flex-col gap-6">
        
        <div class="flex flex-col items-center mb-2">
          <img :src="isotipoUrl" alt="UrbanSphere Isotipo" class="h-32 object-contain mb-2" />
          <h2 class="text-3xl font-black text-slate-900">Crear cuenta</h2>
          <p class="text-slate-500 mt-2 text-sm text-center">Registra tus datos para comenzar en UrbanSphere.</p>
        </div>

        <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold">
          ⚠️ {{ errorMsg }}
        </div>
        
        <div v-if="exitoMsg" class="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-xs font-semibold">
          ✅ {{ exitoMsg }}
        </div>

        <form @submit.prevent="manejarRegistro" class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-900 mb-1">Nombre completo</label>
            <input v-model="nombre" type="text" placeholder="Ej: Juan Pérez" class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003399] transition-colors" required />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-900 mb-1">Correo electrónico</label>
            <input v-model="email" type="email" placeholder="ejemplo@correo.com" class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#003399] transition-colors" required />
          </div>
          
          <div>
            <label class="block text-sm font-bold text-slate-900 mb-1">Contraseña</label>
            <CampoContrasena
              v-model="contrasena"
              placeholder="Crea una contraseña segura"
              required
              autocomplete="new-password"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-900 mb-1">Confirmar contraseña</label>
            <CampoContrasena
              v-model="confirmarContrasena"
              placeholder="Repite la contraseña"
              required
              autocomplete="new-password"
            />
          </div>

          <button type="submit" :disabled="cargando" class="w-full bg-[#003399] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors mt-4 cursor-pointer disabled:opacity-50">
            {{ cargando ? 'Registrando...' : 'Registrar usuario' }}
          </button>
        </form>

        <div class="text-center mt-2 flex flex-col gap-2">
          <router-link to="/login" class="text-sm font-bold text-slate-600 hover:text-[#003399] transition-colors">
            ¿Ya tienes cuenta? Inicia sesión aquí
          </router-link>
          <router-link to="/" class="text-sm font-bold text-slate-400 hover:text-[#003399] transition-colors flex items-center justify-center gap-1">
            <ArrowLeft class="w-4 h-4" /> Volver
          </router-link>
        </div>

      </div>
    </div>

  </div>
</template>
