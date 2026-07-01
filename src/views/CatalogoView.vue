<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { Map } from 'leaflet'
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png'

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = ref<Map | null>(null)
const vistaMobile = ref<'lista' | 'mapa'>('lista')

const propiedades = [
  { id: 1, lat: -33.4253, lng: -70.6074, precio: 'UF 8.950', titulo: 'Condominio Vista Parque', comuna: 'Providencia', tipo: 'Departamento' },
  { id: 2, lat: -33.3533, lng: -70.5186, precio: 'UF 16.500', titulo: 'Casa Mediterránea', comuna: 'Lo Barnechea', tipo: 'Casa' },
  { id: 3, lat: -33.4569, lng: -70.5982, precio: 'UF 5.250', titulo: 'Departamento Tipo Estudio', comuna: 'Ñuñoa', tipo: 'Departamento' },
  { id: 4, lat: -33.3806, lng: -70.5796, precio: 'UF 12.300', titulo: 'Casa en Condominio', comuna: 'Vitacura', tipo: 'Casa' },
]

function initMap() {
  if (!mapContainer.value || mapInstance.value) return

  const map = L.map(mapContainer.value, { zoomControl: false }).setView([-33.41, -70.58], 12)
  mapInstance.value = map

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  propiedades.forEach((prop) => {
    const customIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="flex flex-col items-center -ml-6 -mt-8">
          <div class="bg-[#0f172a] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-[10px] sm:text-xs shadow-lg mb-1 whitespace-nowrap border border-slate-700">
            ${prop.precio}
          </div>
          <div class="w-5 h-5 sm:w-6 sm:h-6 bg-[#003399] rounded-full border-2 border-white flex items-center justify-center shadow-md">
            <span class="text-white text-[8px] sm:text-[10px]">🏠</span>
          </div>
        </div>
      `,
      iconSize: [10, 10],
    })

    L.marker([prop.lat, prop.lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div class="text-center p-1">
          <p class="font-bold text-[#003399]">${prop.titulo}</p>
          <p class="text-xs text-slate-500">${prop.comuna}</p>
          <a href="/propiedad/${prop.id}" class="block mt-2 bg-[#0f172a] text-white text-xs py-1 rounded hover:bg-[#003399]">Ver Detalles</a>
        </div>
      `)
  })
}

async function asegurarMapa() {
  await nextTick()
  initMap()
  mapInstance.value?.invalidateSize()
}

onMounted(async () => {
  if (window.matchMedia('(min-width: 768px)').matches) {
    await asegurarMapa()
  }
})

watch(vistaMobile, async (vista) => {
  if (vista === 'mapa') await asegurarMapa()
})
</script>

<template>
  <PublicLayout>
    <div class="flex flex-col h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-75px)] overflow-hidden">
    <!-- Toggle lista / mapa (solo móvil) -->
    <div class="md:hidden shrink-0 bg-white border-b border-slate-200 px-4 py-2 flex gap-2">
      <button
        type="button"
        class="flex-1 py-2 rounded-lg text-sm font-bold transition-colors"
        :class="vistaMobile === 'lista' ? 'bg-[#003399] text-white' : 'bg-slate-100 text-slate-600'"
        @click="vistaMobile = 'lista'"
      >
        Lista
      </button>
      <button
        type="button"
        class="flex-1 py-2 rounded-lg text-sm font-bold transition-colors"
        :class="vistaMobile === 'mapa' ? 'bg-[#003399] text-white' : 'bg-slate-100 text-slate-600'"
        @click="vistaMobile = 'mapa'"
      >
        Mapa
      </button>
    </div>

    <div class="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
      <!-- Panel lista -->
      <section
        class="md:col-span-5 lg:col-span-4 border-r border-slate-200 overflow-y-auto bg-white flex flex-col min-h-0"
        :class="vistaMobile === 'mapa' ? 'hidden md:flex' : 'flex'"
      >
        <div class="p-4 sm:p-6 border-b border-slate-100 flex flex-col gap-3 sm:gap-4 sticky top-0 bg-white z-10">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">📍</span>
            <input
              type="text"
              class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-[#003399]"
              placeholder="¿Dónde buscas?"
            />
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <select class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white min-w-0">
              <option>Tipo de propiedad</option>
            </select>
            <select class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white min-w-0">
              <option>Presupuesto</option>
            </select>
            <button
              type="button"
              class="bg-[#0f172a] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#003399] transition-colors shrink-0"
            >
              <span>⚡</span> Filtrar
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 pb-8">
          <div class="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 sm:gap-2">
            <h2 class="font-bold text-slate-900 text-sm">126 propiedades encontradas</h2>
            <span class="text-xs text-slate-500">Ordenar: <b class="text-slate-700">Más recientes ⌵</b></span>
          </div>

          <div v-for="prop in propiedades" :key="prop.id" class="flex flex-col gap-4">
            <div
              class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row group hover:border-[#003399] transition-colors"
            >
              <div
                class="w-full sm:w-2/5 h-40 sm:h-auto min-h-[140px] relative bg-slate-50 sm:border-r border-slate-100 flex items-center justify-center p-4"
              >
                <div
                  class="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wide z-10 shadow-sm"
                >
                  En Venta
                </div>
                <img
                  :src="isotipoUrl"
                  alt=""
                  class="w-20 h-20 sm:w-25 sm:h-25 object-contain opacity-40 group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div class="w-full sm:w-3/5 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <h3 class="font-black text-xl sm:text-2xl text-slate-900">{{ prop.precio }}</h3>
                  <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-bold">Valor Simulado CLP</p>
                  <p class="font-bold text-sm text-slate-800 mt-3">{{ prop.titulo }}</p>
                  <p class="text-xs text-slate-500 mt-1">📍 {{ prop.comuna }}, Santiago</p>
                  <div class="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-600 font-medium text-xs mt-3">
                    <span>🛏️ 3</span>
                    <span>🛁 2</span>
                    <span>📐 95 m²</span>
                  </div>
                </div>

                <div class="mt-4 flex gap-2">
                  <router-link
                    :to="`/propiedad/${prop.id}`"
                    class="flex-1 text-center bg-[#0f172a] text-white py-2.5 sm:py-2 rounded-lg text-xs font-bold hover:bg-[#003399] transition-colors"
                  >
                    Ver detalles
                  </router-link>
                  <button
                    type="button"
                    class="px-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
                    aria-label="Guardar favorito"
                  >
                    ♡
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mapa -->
      <section
        class="md:col-span-7 lg:col-span-8 bg-slate-100 relative z-0 min-h-0 flex-1"
        :class="vistaMobile === 'lista' ? 'hidden md:block' : 'block h-full'"
      >
        <div ref="mapContainer" class="absolute inset-0 w-full h-full min-h-[280px]" />
      </section>
    </div>
    </div>
  </PublicLayout>
</template>

<style scoped>
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
</style>
