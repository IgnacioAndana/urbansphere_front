<script setup lang="ts">
import { ref } from 'vue';
import { Send, MessageSquare, User, Mail, MapPin } from 'lucide-vue-next';
import PublicLayout from '../layouts/PublicLayout.vue';

const enviando = ref(false);
const formularioEnviado = ref(false);

const form = ref({
  nombre: '',
  email: '',
  mensaje: ''
});

const enviarFormulario = () => {
  enviando.value = true;
  
  // Aquí es donde se conectará con el microservicio para enviar a RabbitMQ
  // Simulamos un retraso de red de 1.5 segundos
  setTimeout(() => {
    enviando.value = false;
    formularioEnviado.value = true;
    
    console.log("Datos enviados a RabbitMQ:", form.value);
    
    // Limpiar formulario tras unos segundos
    setTimeout(() => {
      formularioEnviado.value = false;
      form.value = { nombre: '', email: '', mensaje: '' };
    }, 4000);
  }, 1500);
};
</script>

<template>
  <PublicLayout>
    <div class="min-h-[calc(100vh-75px)] bg-slate-50 flex items-center py-12 px-4">
      <div class="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <!-- Lado Izquierdo: Información -->
        <div>
          <span class="text-[#003399] font-black tracking-widest uppercase text-xs mb-3 block">Contacto Directo</span>
          <h1 class="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
            ¿Encontraste la propiedad de tus sueños?
          </h1>
          <p class="text-lg text-slate-500 mb-8 leading-relaxed">
            Completa el siguiente formulario con tus dudas o intención de reserva. Nuestra plataforma envía tu solicitud de manera instantánea a nuestros agentes.
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

        <!-- Lado Derecho: Formulario (RabbitMQ) -->
        <div class="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          
          <!-- Estado de Éxito -->
          <div v-if="formularioEnviado" class="absolute inset-0 bg-[#003399] flex flex-col items-center justify-center text-white p-8 text-center z-10 transition-all duration-500">
            <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <Send class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-3xl font-black mb-2">¡Solicitud Enviada!</h3>
            <p class="text-blue-100 text-lg">Tu mensaje ha sido encolado exitosamente y será procesado a la brevedad por un agente disponible.</p>
          </div>

          <h2 class="text-2xl font-black text-slate-900 mb-6">Formulario de Reserva / Consulta</h2>
          
          <form @submit.prevent="enviarFormulario" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Nombre completo</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User class="w-5 h-5" /></span>
                <input v-model="form.nombre" type="text" placeholder="Ej: Ana María Silva" required class="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399] transition-colors" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Correo electrónico</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail class="w-5 h-5" /></span>
                <input v-model="form.email" type="email" placeholder="ejemplo@correo.com" required class="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399] transition-colors" />
              </div>
            </div>


            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Mensaje de consulta o reserva</label>
              <div class="relative">
                <span class="absolute top-3 left-0 flex items-start pl-3 text-slate-400"><MessageSquare class="w-5 h-5" /></span>
                <textarea v-model="form.mensaje" rows="4" placeholder="Indícanos qué necesitas y un agente se contactará contigo." required class="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399] transition-colors resize-none"></textarea>
              </div>
            </div>

            <button type="submit" :disabled="enviando" class="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold hover:bg-[#003399] transition-all shadow-md mt-2 flex items-center justify-center cursor-pointer disabled:opacity-70">
              <span v-if="enviando" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span v-else class="flex items-center gap-2"><Send class="w-5 h-5" /> Enviar Solicitud a Sistema</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  </PublicLayout>
</template>
