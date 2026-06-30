<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { FileText, Users, LogOut, Home, Compass } from 'lucide-vue-next';
import { authService } from '../services/authService';
import imagotipoUrl from '../assets/UrbanSphere-Imagotipo.png';

const router = useRouter();

const usuarioActual = ref({ nombre: 'Usuario', rol: 'Desconocido', iniciales: 'US', rolId: 2 });

onMounted(() => {
  const userStr = localStorage.getItem('urbansphere_user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      let rolTexto = 'Usuario';
      // Según README: 1=admin, 2=user, 3=agent
      if (u.rolId === 1 || u.rol === 'admin') rolTexto = 'Administrador';
      else if (u.rolId === 3 || u.rol === 'agent') rolTexto = 'Agente';
      
      const iniciales = u.nombre ? u.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'US';
      
      usuarioActual.value = {
        nombre: u.nombre || 'Usuario',
        rol: rolTexto,
        iniciales: iniciales,
        rolId: u.rolId || (u.rol === 'admin' ? 1 : (u.rol === 'agent' ? 3 : 2))
      };
    } catch(e) {}
  }
});

const cerrarSesion = () => {
  authService.logout();
  router.push('/login');
};
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    
    <aside class="w-64 bg-[#0f172a] text-slate-300 flex flex-col shadow-xl z-20">
      <div class="p-6 border-b border-slate-800 flex items-center justify-center h-[73px] shrink-0 bg-white">
        <img :src="imagotipoUrl" alt="UrbanSphere Admin" class="h-9 object-contain" />
      </div>
      
      <div class="p-4 uppercase text-[10px] font-bold text-slate-500 tracking-wider">Menú Principal</div>
      <nav class="flex-1 px-4 flex flex-col gap-1 mt-2">
        <router-link to="/admin/nuevo-proyecto" class="flex items-center gap-3 px-3 py-3 hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors" active-class="bg-[#003399] text-white font-bold hover:bg-[#003399]">
          <FileText class="w-4 h-4" /> Proyectos
        </router-link>
        <router-link to="/admin/usuarios" class="flex items-center gap-3 px-3 py-3 hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors" active-class="bg-[#003399] text-white font-bold hover:bg-[#003399]">
          <Users class="w-4 h-4" /> Usuarios
        </router-link>
      </nav>
      
      <div class="p-4 border-t border-slate-800 flex flex-col gap-2">
        <router-link to="/" class="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors text-slate-300">
          <Home class="w-4 h-4" /> Inicio
        </router-link>
        <router-link to="/catalogo" class="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors text-slate-300">
          <Compass class="w-4 h-4" /> Catálogo
        </router-link>
        <button @click="cerrarSesion" class="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg font-medium text-sm text-red-400 mt-2 cursor-pointer transition-colors text-left">
          <LogOut class="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
        <div class="text-sm text-slate-500 font-medium">Proyectos > <span class="text-[#003399] font-bold">Nuevo Proyecto</span></div>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-100 text-[#003399] rounded-full flex items-center justify-center font-bold text-xs">{{ usuarioActual.iniciales }}</div>
          <div class="text-xs">
            <p class="font-bold text-slate-800">{{ usuarioActual.nombre }}</p>
            <p class="text-slate-500">{{ usuarioActual.rol }}</p>
          </div>
        </div>
      </header>
      
      <div class="flex-1 overflow-y-auto p-8">
        <slot />
      </div>
    </main>

  </div>
</template>