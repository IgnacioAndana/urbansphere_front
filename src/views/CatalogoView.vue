<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MapPin, Filter, Bed, Bath, Maximize, Heart, Home } from 'lucide-vue-next';
import PublicLayout from '../layouts/PublicLayout.vue';
import 'leaflet/dist/leaflet.css'; // Importación vital para que el mapa no se rompa
import L from 'leaflet';
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png';

// Referencia al contenedor del HTML donde vivirá el mapa
const mapContainer = ref<HTMLElement | null>(null);

// Variables reactivas para el filtrado
const filtroTexto = ref('');
const filtroTipo = ref('Todos');

// Datos duros (Mocks) extendidos
const propiedadesMock = [
  { id: 1, lat: -33.4253, lng: -70.6074, precio: 'UF 8.950', titulo: 'Condominio Vista Parque', comuna: 'Providencia', tipo: 'Departamento' },
  { id: 2, lat: -33.3533, lng: -70.5186, precio: 'UF 16.500', titulo: 'Casa Mediterránea', comuna: 'Lo Barnechea', tipo: 'Casa' },
  { id: 3, lat: -33.4569, lng: -70.5982, precio: 'UF 5.250', titulo: 'Departamento Tipo Estudio', comuna: 'Ñuñoa', tipo: 'Departamento' },
  { id: 4, lat: -33.3806, lng: -70.5796, precio: 'UF 12.300', titulo: 'Casa en Condominio', comuna: 'Vitacura', tipo: 'Casa' },
  { id: 5, lat: -33.4140, lng: -70.5694, precio: 'UF 10.200', titulo: 'Depto Nuevo El Golf', comuna: 'Las Condes', tipo: 'Departamento' },
  { id: 6, lat: -33.4372, lng: -70.6348, precio: 'UF 4.800', titulo: 'Loft Bellas Artes', comuna: 'Santiago Centro', tipo: 'Departamento' },
  { id: 7, lat: -33.4862, lng: -70.7516, precio: 'UF 6.500', titulo: 'Casa Familiar 4D3B', comuna: 'Maipú', tipo: 'Casa' },
  { id: 8, lat: -33.5042, lng: -70.5878, precio: 'UF 8.100', titulo: 'Townhouse La Florida', comuna: 'La Florida', tipo: 'Casa' }
];

import { computed, watch } from 'vue';

// Computed para filtrar las propiedades en tiempo real
const propiedades = computed(() => {
  return propiedadesMock.filter(prop => {
    const cumpleTexto = prop.titulo.toLowerCase().includes(filtroTexto.value.toLowerCase()) || 
                        prop.comuna.toLowerCase().includes(filtroTexto.value.toLowerCase());
    const cumpleTipo = filtroTipo.value === 'Todos' || prop.tipo === filtroTipo.value;
    return cumpleTexto && cumpleTipo;
  });
});

let leafletMap: L.Map;
let markersLayer: L.LayerGroup;

onMounted(() => {
  if (!mapContainer.value) return;

  // 1. Inicializar el mapa centrado en Santiago (Zoom 12)
  leafletMap = L.map(mapContainer.value, {
    zoomControl: false // Ocultamos el control por defecto para un look más limpio
  }).setView([-33.41, -70.58], 11);

  // Agregamos controles de zoom abajo a la derecha
  L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

  // 2. Capa de diseño del mapa (CartoDB Voyager - Tonos claros)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(leafletMap);

  // Grupo para marcadores
  markersLayer = L.layerGroup().addTo(leafletMap);

  // Renderizar pines iniciales
  renderizarPines(propiedades.value);
});

// Vigilar los cambios en la lista filtrada para repintar el mapa
watch(propiedades, (nuevasPropiedades) => {
  renderizarPines(nuevasPropiedades);
});

const renderizarPines = (listaProps: typeof propiedadesMock) => {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  // 3. Renderizar los Pines Personalizados con Tailwind HTML
  listaProps.forEach(prop => {
    const customIcon = L.divIcon({
      className: 'bg-transparent', // Quitamos el fondo blanco por defecto de Leaflet
      html: `
        <div class="flex flex-col items-center -ml-6 -mt-8">
          <div class="bg-[#0f172a] text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-lg mb-1 whitespace-nowrap border border-slate-700">
            ${prop.precio}
          </div>
          <div class="w-6 h-6 bg-[#003399] rounded-full border-2 border-white flex items-center justify-center shadow-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        </div>
      `,
      iconSize: [10, 10], // Tamaño base nominal
    });

    // Agregar el pin al mapa con un Popup al hacer clic
    L.marker([prop.lat, prop.lng], { icon: customIcon })
      .addTo(markersLayer)
      .bindPopup(`
        <div class="flex flex-col gap-1 min-w-[160px] p-1">
          <div class="font-black text-lg text-slate-900">${prop.precio}</div>
          <div class="font-bold text-sm text-[#003399] leading-tight">${prop.titulo}</div>
          <div class="text-[10px] text-slate-500 uppercase tracking-wider mt-1"><b class="text-slate-700">${prop.tipo}</b> • ${prop.comuna}</div>
          <a href="/propiedad/${prop.id}" class="mt-3 block text-center bg-[#0f172a] text-white text-xs py-2 rounded-lg font-bold hover:bg-[#003399] transition-all shadow-sm">Ver Detalles</a>
        </div>
      `);
  });
};
</script>

<template>
  <PublicLayout>
    <div class="flex-1 grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-73px)] overflow-hidden">
      
      <!-- PANEL IZQUIERDO: Lista de Propiedades (Alineado a Mock 2) -->
      <section class="md:col-span-5 lg:col-span-4 border-r border-slate-200 overflow-y-auto bg-white flex flex-col">
        
        <!-- Cabecera de Filtros Fija -->
        <div class="p-6 border-b border-slate-100 flex flex-col gap-4 sticky top-0 bg-white z-10">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <MapPin class="w-5 h-5" />
            </span>
            <input v-model="filtroTexto" type="text" class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399]" placeholder="¿Dónde buscas? (Ej: Providencia, Santiago)" />
          </div>
          <div class="flex gap-2">
            <select v-model="filtroTipo" class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:border-[#003399]">
              <option value="Todos">Cualquier tipo</option>
              <option value="Departamento">Departamento</option>
              <option value="Casa">Casa</option>
            </select>
            <select class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white">
              <option>Presupuesto</option>
            </select>
            <button class="bg-[#0f172a] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#003399] transition-colors">
              <Filter class="w-4 h-4" /> Filtrar
            </button>
          </div>
        </div>

        <!-- Resultados -->
        <div class="p-6 flex flex-col gap-6">
          <div class="flex justify-between items-center">
            <h2 class="font-bold text-slate-900 text-sm">{{ propiedades.length }} propiedades encontradas</h2>
            <span class="text-xs text-slate-500">Ordenar por: <b class="text-slate-700">Más relevantes ⌵</b></span>
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
                  <p class="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin class="w-3 h-3" /> {{ prop.comuna }}, Santiago</p>
                  
                  <div class="flex items-center gap-4 text-slate-600 font-medium text-xs mt-3">
                    <span class="flex items-center gap-1"><Bed class="w-4 h-4 text-slate-400" /> 3</span>
                    <span class="flex items-center gap-1"><Bath class="w-4 h-4 text-slate-400" /> 2</span>
                    <span class="flex items-center gap-1"><Maximize class="w-4 h-4 text-slate-400" /> 95 m²</span>
                  </div>
                </div>

                <div class="mt-4 flex gap-2">
                  <router-link :to="`/propiedad/${prop.id}`" class="flex-1 text-center bg-[#0f172a] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#003399] transition-colors">
                    Ver detalles
                  </router-link>
                  <button class="px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-colors flex items-center justify-center">
                    <Heart class="w-4 h-4" />
                  </button>
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