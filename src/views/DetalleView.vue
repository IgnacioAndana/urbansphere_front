<script setup lang="ts">
import { useRoute } from 'vue-router';
import PublicLayout from '../layouts/PublicLayout.vue';

const route = useRoute();
const propiedadId = route.params.id; // Captura el ID de la URL (ej: /propiedad/1)
</script>

<template>
  <PublicLayout>
    <div class="max-w-7xl mx-auto p-4 sm:p-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
      
      <!-- Bloque Izquierdo: Ficha del Proyecto (8 Columnas) -->
      <div class="lg:col-span-8 flex flex-col gap-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs bg-blue-100 text-urban-blue font-bold px-3 py-1 rounded-full">PROYECTO RESIDENCIAL</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Vista Parque Residencias (ID: {{ propiedadId }})</h1>
          <p class="text-slate-500 font-medium mt-1">📍 Av. El Parque 1234, Providencia, Santiago</p>
          <p class="text-2xl font-black text-urban-blue mt-4">Desde UF 8.950</p>
        </div>

        <!-- Placeholder del Visor 360° -->
        <div class="bg-slate-900 text-white h-96 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-slate-800 shadow-inner relative overflow-hidden">
          <span class="text-4xl mb-2">🔄</span>
          <h2 class="text-xl font-bold">Visor Inmersivo 360°</h2>
          <p class="text-sm text-slate-400 mt-1 max-w-md">Aquí se integrará el componente esférico para el recorrido virtual interactivo.</p>
        </div>
      </div>

      <!-- Bloque Derecho: Formulario de Captura de Leads (4 Columnas) -->
      <div class="lg:col-span-4">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Me interesa este proyecto</h3>
          <form class="flex flex-col gap-3" @submit.prevent>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre completo *</label>
              <input type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-urban-blue" placeholder="Ej: Juan Pérez" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Correo electrónico *</label>
              <input type="email" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-urban-blue" placeholder="ejemplo@correo.com" />
            </div>
            <button class="w-full bg-urban-blue text-white py-3 rounded-lg font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm mt-2">
              Enviar Solicitud
            </button>
          </form>
        </div>
      </div>

    </div>
  </PublicLayout>
</template>