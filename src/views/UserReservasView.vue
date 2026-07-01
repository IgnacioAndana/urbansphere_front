<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CalendarClock, Info, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import PublicLayout from '../layouts/PublicLayout.vue';
import { authService } from '../services/usuarios';

const router = useRouter();
const usuarioActual = ref({ nombre: 'Usuario', iniciales: 'US' });

onMounted(() => {
  const userStr = localStorage.getItem('urbansphere_user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      const iniciales = u.nombre ? u.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'US';
      usuarioActual.value = {
        nombre: u.nombre || 'Usuario',
        iniciales: iniciales
      };
    } catch(e) {}
  }
});

const cerrarSesion = () => {
  authService.cerrarSesion();
  router.push('/');
};
</script>

<template>
  <PublicLayout>
    <div class="bg-slate-50 min-h-[calc(100vh-75px)] py-10 px-4">
      <div class="max-w-5xl mx-auto">
        
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-[#003399] flex items-center justify-center text-white text-xl font-bold shadow-md">
              {{ usuarioActual.iniciales }}
            </div>
            <div>
              <h1 class="text-2xl font-black text-slate-900">Hola, {{ usuarioActual.nombre }}</h1>
              <p class="text-slate-500 text-sm">Bienvenido a tu panel de usuario</p>
            </div>
          </div>
          <button @click="cerrarSesion" class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
            <LogOut class="w-4 h-4" /> Cerrar Sesión
          </button>
        </header>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <CalendarClock class="w-10 h-10 text-[#003399]" />
          </div>
          <h2 class="text-2xl font-black text-slate-800 mb-2">Mis Reservas y Consultas</h2>
          <p class="text-slate-500 max-w-md mx-auto mb-8">
            Aquí podrás hacer seguimiento a las propiedades que te interesan, tus solicitudes de contacto y el estado de tus reservas.
          </p>

          <div class="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-start gap-3 max-w-lg mx-auto text-left">
            <Info class="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 class="font-bold text-sm">Funcionalidad en desarrollo</h4>
              <p class="text-xs mt-1 opacity-90">Pronto habilitaremos el historial completo para que gestiones tus trámites inmobiliarios directamente desde este panel.</p>
            </div>
          </div>

          <router-link to="/" class="mt-8 px-6 py-3 bg-[#0f172a] hover:bg-[#003399] text-white rounded-xl font-bold text-sm transition-colors shadow-md">
            Explorar el Catálogo
          </router-link>
        </div>

      </div>
    </div>
  </PublicLayout>
</template>
