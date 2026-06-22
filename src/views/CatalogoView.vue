<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PublicLayout from '../layouts/PublicLayout.vue';
import 'leaflet/dist/leaflet.css'; // Importación vital para que el mapa no se rompa
import L from 'leaflet';
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png';

// Referencia al contenedor del HTML donde vivirá el mapa
const mapContainer = ref<HTMLElement | null>(null);

// Datos duros (Mocks) basados en tu diseño y el script de BD de Ignacio
const propiedades = [
  { id: 1, lat: -33.4253, lng: -70.6074, precio: 'UF 8.950', titulo: 'Condominio Vista Parque', comuna: 'Providencia', tipo: 'Departamento' },
  { id: 2, lat: -33.3533, lng: -70.5186, precio: 'UF 16.500', titulo: 'Casa Mediterránea', comuna: 'Lo Barnechea', tipo: 'Casa' },
  { id: 3, lat: -33.4569, lng: -70.5982, precio: 'UF 5.250', titulo: 'Departamento Tipo Estudio', comuna: 'Ñuñoa', tipo: 'Departamento' },
  { id: 4, lat: -33.3806, lng: -70.5796, precio: 'UF 12.300', titulo: 'Casa en Condominio', comuna: 'Vitacura', tipo: 'Casa' }
];

onMounted(() => {
  if (!mapContainer.value) return;

  // 1. Inicializar el mapa centrado en Santiago (Zoom 12)
  const map = L.map(mapContainer.value, {
    zoomControl: false // Ocultamos el control por defecto para un look más limpio
  }).setView([-33.41, -70.58], 12);

  // Agregamos controles de zoom abajo a la derecha
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // 2. Capa de diseño del mapa (CartoDB Voyager - Tonos claros)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // 3. Renderizar los Pines Personalizados con Tailwind HTML
  propiedades.forEach(prop => {
    const customIcon = L.divIcon({
      className: 'bg-transparent', // Quitamos el fondo blanco por defecto de Leaflet
      html: `
        <div class="flex flex-col items-center -ml-6 -mt-8">
          <div class="bg-[#0f172a] text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-lg mb-1 whitespace-nowrap border border-slate-700">
            ${prop.precio}
          </div>
          <div class="w-6 h-6 bg-[#003399] rounded-full border-2 border-white flex items-center justify-center shadow-md">
            <span class="text-white text-[10px]">🏠</span>
          </div>
        </div>
      `,
      iconSize: [10, 10], // Tamaño base nominal
    });

    // Agregar el pin al mapa con un Popup al hacer clic
    L.marker([prop.lat, prop.lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div class="text-center p-1">
          <p class="font-bold text-[#003399]">${prop.titulo}</p>
          <p class="text-xs text-slate-500">${prop.comuna}</p>
          <a href="/propiedad/${prop.id}" class="block mt-2 bg-[#0f172a] text-white text-xs py-1 rounded hover:bg-[#003399]">Ver Detalles</a>
        </div>
      `);
  });
});
</script>

<template>
  <PublicLayout>
    <div class="flex-1 grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-73px)] overflow-hidden">
      
      <!-- PANEL IZQUIERDO: Lista de Propiedades (Alineado a Mock 2) -->
      <section class="md:col-span-5 lg:col-span-4 border-r border-slate-200 overflow-y-auto bg-white flex flex-col">
        
        <!-- Cabecera de Filtros Fija -->
        <div class="p-6 border-b border-slate-100 flex flex-col gap-4 sticky top-0 bg-white z-10">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">📍</span>
            <input type="text" class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399]" placeholder="¿Dónde buscas? (Ej: Providencia, Santiago)" />
          </div>
          <div class="flex gap-2">
            <select class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white">
              <option>Tipo de propiedad</option>
            </select>
            <select class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white">
              <option>Presupuesto</option>
            </select>
            <button class="bg-[#0f172a] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#003399] transition-colors">
              <span>⚡</span> Filtrar
            </button>
          </div>
        </div>

        <!-- Resultados -->
        <div class="p-6 flex flex-col gap-6">
          <div class="flex justify-between items-center">
            <h2 class="font-bold text-slate-900 text-sm">126 propiedades encontradas</h2>
            <span class="text-xs text-slate-500">Ordenar por: <b class="text-slate-700">Más recientes ⌵</b></span>
          </div>
          
          <!-- Renderizado Reactivo de las Tarjetas -->
          <div v-for="prop in propiedades" :key="prop.id" class="flex flex-col gap-4">
            <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row group hover:border-[#003399] transition-colors">
              
              <!-- Imagen Izquierda -->
              <div class="sm:w-2/5 h-48 sm:h-auto relative bg-slate-50 border-r border-slate-100 flex items-center justify-center p-4">
                <div class="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wide z-10 shadow-sm">
                  En Venta
                </div>
                <img :src="isotipoUrl" alt="Preview Asset" class="w-25 h-25 object-contain opacity-40 group-hover:scale-110 transition-transform duration-300" />
              </div>

              <!-- Datos Derecha -->
              <div class="sm:w-3/5 p-4 flex flex-col justify-between">
                <div>
                  <h3 class="font-black text-2xl text-slate-900">{{ prop.precio }}</h3>
                  <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-bold">Valor Simulado CLP</p>
                  
                  <p class="font-bold text-sm text-slate-800 mt-3">{{ prop.titulo }}</p>
                  <p class="text-xs text-slate-500 mt-1">📍 {{ prop.comuna }}, Santiago</p>
                  
                  <div class="flex items-center gap-4 text-slate-600 font-medium text-xs mt-3">
                    <span>🛏️ 3</span>
                    <span>🛁 2</span>
                    <span>📐 95 m²</span>
                  </div>
                </div>

                <div class="mt-4 flex gap-2">
                  <router-link :to="`/propiedad/${prop.id}`" class="flex-1 text-center bg-[#0f172a] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#003399] transition-colors">
                    Ver detalles
                  </router-link>
                  <button class="px-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">♡</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- PANEL DERECHO: Mapa de Leaflet -->
      <section class="hidden md:col-span-7 lg:col-span-8 bg-slate-100 relative md:block z-0">
         <div ref="mapContainer" class="w-full h-full"></div>
      </section>

    </div>
  </PublicLayout>
</template>

<style scoped>
/* Aseguramos que los popups de Leaflet no hereden estilos raros */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
</style>