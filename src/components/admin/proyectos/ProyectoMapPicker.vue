<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { configurarIconosLeaflet } from '../../../utils/leafletSetup'

configurarIconosLeaflet()

const latitud = defineModel<number>('latitud', { required: true })
const longitud = defineModel<number>('longitud', { required: true })

const mapContainer = ref<HTMLElement | null>(null)
const listoParaMapa = ref(false)

let map: L.Map | null = null
let marker: L.Marker | null = null

function destruirMapa() {
  if (map) {
    map.remove()
    map = null
    marker = null
  }
}

function initMap() {
  const el = mapContainer.value
  if (!el || el.offsetParent === null && el.offsetWidth === 0) return false

  try {
    destruirMapa()
    map = L.map(el).setView([latitud.value, longitud.value], 13)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    marker = L.marker([latitud.value, longitud.value], { draggable: true }).addTo(map)

    marker.on('dragend', (e) => {
      const position = e.target.getLatLng()
      latitud.value = Number(position.lat.toFixed(6))
      longitud.value = Number(position.lng.toFixed(6))
    })

    map.on('click', (e) => {
      latitud.value = Number(e.latlng.lat.toFixed(6))
      longitud.value = Number(e.latlng.lng.toFixed(6))
      marker?.setLatLng(e.latlng)
    })

    requestAnimationFrame(() => map?.invalidateSize())
    return true
  } catch {
    return false
  }
}

async function montarMapa() {
  listoParaMapa.value = true
  await nextTick()
  await nextTick()

  if (initMap()) return

  requestAnimationFrame(() => {
    if (!initMap()) {
      setTimeout(() => initMap(), 100)
    }
  })
}

function actualizarDesdeInputs() {
  if (!map || !marker) return
  const lat = Number(latitud.value)
  const lng = Number(longitud.value)
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    const pos = L.latLng(lat, lng)
    marker.setLatLng(pos)
    map.setView(pos)
  }
}

onMounted(montarMapa)
onUnmounted(destruirMapa)

watch([latitud, longitud], () => {
  if (map && marker) actualizarDesdeInputs()
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-if="!listoParaMapa"
      class="w-full bg-slate-100 rounded-xl border border-slate-200 min-h-[200px] animate-pulse"
    />
    <div
      v-show="listoParaMapa"
      ref="mapContainer"
      class="w-full bg-slate-100 rounded-xl border border-slate-200 min-h-[200px] z-0"
    />
    <p class="text-[10px] text-slate-500">Arrastra el marcador o haz clic en el mapa.</p>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Latitud</label>
        <input
          v-model.number="latitud"
          type="number"
          step="any"
          required
          class="w-full border border-slate-200 bg-slate-50 focus:border-[#003399] focus:bg-white focus:outline-none rounded-lg p-2 text-xs text-slate-600 font-mono"
          @change="actualizarDesdeInputs"
        />
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Longitud</label>
        <input
          v-model.number="longitud"
          type="number"
          step="any"
          required
          class="w-full border border-slate-200 bg-slate-50 focus:border-[#003399] focus:bg-white focus:outline-none rounded-lg p-2 text-xs text-slate-600 font-mono"
          @change="actualizarDesdeInputs"
        />
      </div>
    </div>
  </div>
</template>
