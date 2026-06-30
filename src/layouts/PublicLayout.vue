<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// Importamos el imagotipo horizontal directamente desde assets
import imagotipoUrl from '../assets/UrbanSphere-Imagotipo.png';
import { authService } from '../services/authService';

const estaLogueado = ref(false);
const rolId = ref<number | null>(null);
const nombreUsuario = ref('');
const route = useRoute();
const router = useRouter();

const revisarEstadoSesion = () => {
  const token = localStorage.getItem('urbansphere_token');
  const userStr = localStorage.getItem('urbansphere_user');
  
  if (token && userStr) {
    estaLogueado.value = true;
    try {
      const u = JSON.parse(userStr);
      rolId.value = u.rolId ? Number(u.rolId) : (u.rol === 'admin' ? 1 : (u.rol === 'agent' ? 3 : 2));
      nombreUsuario.value = u.nombre || '';
    } catch(e) {}
  } else {
    estaLogueado.value = false;
    rolId.value = null;
    nombreUsuario.value = '';
  }
};

onMounted(() => {
  revisarEstadoSesion();
});

// Forzar reactividad del navbar cuando cambie la ruta en el mismo layout
watch(() => route.path, () => {
  revisarEstadoSesion();
});

const cerrarSesion = () => {
  authService.logout();
  revisarEstadoSesion();
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 px-3 py-3 flex items-center justify-between shadow-sm h-[75px]">
      <router-link to="/" class="flex items-center">
        <img :src="imagotipoUrl" alt="UrbanSphere Logo" class="h-15 w-60 object-contain" />
      </router-link>
      
      <nav class="flex items-center gap-6 font-semibold text-sm text-slate-600">
        <router-link to="/" class="hover:text-[#003399] transition-colors py-1" exact-active-class="text-[#003399] border-b-2 border-[#003399]">Inicio</router-link>
        <router-link to="/catalogo" class="hover:text-[#003399] transition-colors py-1" exact-active-class="text-[#003399] border-b-2 border-[#003399]">Catálogo</router-link>
        <router-link to="/contacto" class="hover:text-[#003399] transition-colors py-1" exact-active-class="text-[#003399] border-b-2 border-[#003399]">Contacto</router-link>
        
        <template v-if="!estaLogueado">
          <router-link to="/login" class="bg-[#003399] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all shadow-sm">
            Iniciar Sesión
          </router-link>
        </template>
        <template v-else>
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-black text-[#003399] bg-blue-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
              HOLA, {{ nombreUsuario.split(' ')[0] }}
            </span>
            <router-link v-if="rolId === 1 || rolId === 3" to="/admin/nuevo-proyecto" class="bg-[#0f172a] text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition-all shadow-sm">
              Panel Admin
            </router-link>
            <button @click="cerrarSesion" class="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer">
              Cerrar Sesión
            </button>
          </div>
        </template>
      </nav>
    </header>

    <main class="flex-1 flex flex-col">
      <slot />
    </main>

  </div>
</template>