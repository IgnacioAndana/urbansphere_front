<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { MapPin, Bed, Bath, Maximize, Heart } from 'lucide-vue-next'
import PublicLayout from '../layouts/PublicLayout.vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { configurarIconosLeaflet } from '../utils/leafletSetup'
import { catalogoService } from '../services/proyectos'
import { obtenerMensajeError } from '../utils/apiError'
import {
  extraerComunas,
  filtrarProyectosCatalogo,
  formatearPrecioUf,
  formatearRango,
  type ProyectoCatalogoItem,
} from '../utils/catalogoProyecto'
import { useFavoritos } from '../composables/useFavoritos'
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png'

configurarIconosLeaflet()

const mapContainer = ref<HTMLElement | null>(null)
const vistaMobile = ref<'lista' | 'mapa'>('lista')

const proyectosRaw = ref<ProyectoCatalogoItem[]>([])
const cargando = ref(true)
const errorMsg = ref('')

const filtroTexto = ref('')
const filtroComuna = ref('Todas')
const precioMin = ref<number | null>(null)
const precioMax = ref<number | null>(null)

const { puedeUsarFavoritos, esFavorito, cargarFavoritos, alternarFavorito } = useFavoritos()

const comunas = computed(() => ['Todas', ...extraerComunas(proyectosRaw.value)])

const proyectos = computed(() =>
  filtrarProyectosCatalogo(proyectosRaw.value, {
    texto: filtroTexto.value,
    comuna: filtroComuna.value,
    precioMin: precioMin.value,
    precioMax: precioMax.value,
  }),
)

let leafletMap: L.Map | undefined
let markersLayer: L.LayerGroup | undefined

function renderizarPines(lista: ProyectoCatalogoItem[]) {
  if (!markersLayer) return
  markersLayer.clearLayers()

  lista.forEach((prop) => {
    const precio = formatearPrecioUf(prop.precioDesdeUf)
    const customIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="flex flex-col items-center -ml-6 -mt-8">
          <div class="bg-[#0f172a] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-[10px] sm:text-xs shadow-lg mb-1 whitespace-nowrap border border-slate-700">
            ${precio}
          </div>
          <div class="w-6 h-6 bg-[#003399] rounded-full border-2 border-white flex items-center justify-center shadow-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        </div>
      `,
      iconSize: [10, 10],
    })

    L.marker([prop.latitud, prop.longitud], { icon: customIcon })
      .addTo(markersLayer!)
      .bindPopup(`
        <div class="flex flex-col gap-1 min-w-[160px] p-1">
          <div class="font-black text-lg text-slate-900">${precio}</div>
          <div class="font-bold text-sm text-[#003399] leading-tight">${prop.titulo}</div>
          <div class="text-[10px] text-slate-500 uppercase tracking-wider mt-1">${prop.comuna}</div>
          <a href="/propiedad/${prop.id}" class="mt-3 block text-center bg-[#0f172a] text-white text-xs py-2 rounded-lg font-bold">Ver detalles</a>
        </div>
      `)
  })
}

function initMap() {
  if (!mapContainer.value || leafletMap) return

  leafletMap = L.map(mapContainer.value, { zoomControl: false }).setView([-33.41, -70.58], 11)
  L.control.zoom({ position: 'bottomright' }).addTo(leafletMap)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(leafletMap)

  markersLayer = L.layerGroup().addTo(leafletMap)
  renderizarPines(proyectos.value)
}

async function asegurarMapa() {
  await nextTick()
  initMap()
  leafletMap?.invalidateSize()
}

watch(proyectos, (lista) => renderizarPines(lista))

watch(vistaMobile, async (vista) => {
  if (vista === 'mapa') await asegurarMapa()
})

async function cargarCatalogo() {
  cargando.value = true
  errorMsg.value = ''
  try {
    proyectosRaw.value = await catalogoService.listarActivos()
    await cargarFavoritos()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo cargar el catálogo.')
  } finally {
    cargando.value = false
    if (window.matchMedia('(min-width: 768px)').matches) {
      await asegurarMapa()
    }
  }
}

onMounted(cargarCatalogo)

async function toggleFavorito(id: number) {
  await alternarFavorito(id)
}
</script>

<template>
  <PublicLayout>
    <div class="flex flex-col h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-75px)] overflow-hidden">
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
        <section
          class="md:col-span-5 lg:col-span-4 border-r border-slate-200 overflow-y-auto bg-white flex flex-col min-h-0"
          :class="vistaMobile === 'mapa' ? 'hidden md:flex' : 'flex'"
        >
          <div class="p-4 sm:p-6 border-b border-slate-100 flex flex-col gap-3 shrink-0 bg-white">
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MapPin class="w-5 h-5" />
              </span>
              <input
                v-model="filtroTexto"
                type="text"
                class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003399]"
                placeholder="Buscar por nombre, comuna o dirección"
              />
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <select
                v-model="filtroComuna"
                class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:border-[#003399]"
              >
                <option v-for="c in comunas" :key="c" :value="c">{{ c === 'Todas' ? 'Todas las comunas' : c }}</option>
              </select>
              <input
                v-model.number="precioMin"
                type="number"
                min="0"
                step="100"
                placeholder="UF mín."
                class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white min-w-0"
              />
              <input
                v-model.number="precioMax"
                type="number"
                min="0"
                step="100"
                placeholder="UF máx."
                class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white min-w-0"
              />
            </div>
          </div>

          <div class="p-4 sm:p-6 flex flex-col gap-4 pb-8">
            <div v-if="errorMsg" class="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{{ errorMsg }}</div>
            <div v-if="cargando" class="text-center text-slate-400 py-12">Cargando proyectos...</div>

            <template v-else>
              <div class="flex justify-between items-center gap-2">
                <h2 class="font-bold text-slate-900 text-sm">{{ proyectos.length }} departamentos encontrados</h2>
              </div>

              <p v-if="proyectos.length === 0" class="text-sm text-slate-400 text-center py-8">
                No hay proyectos activos que coincidan con tu búsqueda.
              </p>

              <div v-for="prop in proyectos" :key="prop.id" class="flex flex-col gap-4">
                <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row group hover:border-[#003399] transition-colors">
                  <div class="w-full sm:w-2/5 h-40 sm:h-auto min-h-[140px] relative bg-slate-100 sm:border-r border-slate-100 overflow-hidden">
                    <img
                      v-if="prop.urlPortada"
                      :src="prop.urlPortada"
                      :alt="prop.titulo"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center p-4">
                      <img :src="isotipoUrl" alt="" class="w-20 h-20 object-contain opacity-30" />
                    </div>
                    <div class="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase">
                      En venta
                    </div>
                  </div>

                  <div class="w-full sm:w-3/5 p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 class="font-black text-xl sm:text-2xl text-slate-900">{{ formatearPrecioUf(prop.precioDesdeUf) }}</h3>
                      <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-bold">Desde · Departamento</p>
                      <p class="font-bold text-sm text-slate-800 mt-3">{{ prop.titulo }}</p>
                      <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin class="w-3 h-3" /> {{ prop.comuna }} · {{ prop.direccion }}
                      </p>
                      <div class="flex flex-wrap items-center gap-3 text-slate-600 font-medium text-xs mt-3">
                        <span class="flex items-center gap-1">
                          <Bed class="w-4 h-4 text-slate-400" />
                          {{ formatearRango(prop.dormitoriosMin, prop.dormitoriosMax) }}
                        </span>
                        <span class="flex items-center gap-1">
                          <Bath class="w-4 h-4 text-slate-400" />
                          {{ formatearRango(prop.banosMin, prop.banosMax) }}
                        </span>
                        <span class="flex items-center gap-1">
                          <Maximize class="w-4 h-4 text-slate-400" />
                          {{ formatearRango(prop.superficieMin, prop.superficieMax, ' m²') }}
                        </span>
                      </div>
                    </div>

                    <div class="mt-4 flex gap-2">
                      <router-link
                        :to="`/propiedad/${prop.id}`"
                        class="flex-1 text-center bg-[#0f172a] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#003399] transition-colors"
                      >
                        Ver detalles
                      </router-link>
                      <button
                        v-if="puedeUsarFavoritos"
                        type="button"
                        class="px-3 border rounded-lg transition-colors flex items-center justify-center shrink-0"
                        :class="esFavorito(prop.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                        :title="esFavorito(prop.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                        @click="toggleFavorito(prop.id)"
                      >
                        <Heart class="w-4 h-4" :class="esFavorito(prop.id) ? 'fill-current' : ''" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </section>

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
