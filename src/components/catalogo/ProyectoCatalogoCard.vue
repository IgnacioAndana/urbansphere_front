<script setup lang="ts">
import { MapPin, Bed, Bath, Maximize, Heart } from 'lucide-vue-next'
import {
  formatearPrecioUf,
  formatearRango,
  formatearTipoProyecto,
  type ProyectoCatalogoItem,
} from '../../utils/catalogoProyecto'
import isotipoUrl from '../../assets/UrbanSphere-Isotipo.png'

defineProps<{
  prop: ProyectoCatalogoItem
  esFavorito?: boolean
  mostrarFavorito?: boolean
}>()

const emit = defineEmits<{
  toggleFavorito: [id: number]
}>()
</script>

<template>
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
        <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-bold">
          Desde · {{ formatearTipoProyecto(prop.tipo) }}
        </p>
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
          v-if="mostrarFavorito"
          type="button"
          class="px-3 border rounded-lg transition-colors flex items-center justify-center shrink-0"
          :class="esFavorito ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
          :title="esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'"
          @click="emit('toggleFavorito', prop.id)"
        >
          <Heart class="w-4 h-4" :class="esFavorito ? 'fill-current' : ''" />
        </button>
      </div>
    </div>
  </div>
</template>
