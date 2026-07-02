<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const latitud = defineModel<number>('latitud', { required: true })
const longitud = defineModel<number>('longitud', { required: true })

let map: L.Map | null = null
let marker: L.Marker | null = null

const initMap = () => {
  if (map) map.remove()

  map = L.map('proyectoMapPicker').setView([latitud.value, longitud.value], 13)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map)

  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  marker = L.marker([latitud.value, longitud.value], { draggable: true, icon }).addTo(map)

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

  nextTick(() => map?.invalidateSize())
}

const actualizarDesdeInputs = () => {
  if (!map || !marker) return
  const lat = Number(latitud.value)
  const lng = Number(longitud.value)
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    const pos = L.latLng(lat, lng)
    marker.setLatLng(pos)
    map.setView(pos)
  }
}

onMounted(() => nextTick(initMap))
onUnmounted(() => {
  map?.remove()
  map = null
})

watch([latitud, longitud], () => {
  if (map && marker) actualizarDesdeInputs()
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div id="proyectoMapPicker" class="w-full bg-slate-100 rounded-xl border border-slate-200 min-h-[200px] z-0" />
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
