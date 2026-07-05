<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { MapPin, Bed, Bath, Maximize } from 'lucide-vue-next'
import {
  formatearPrecioUf,
  formatearPrecioClp,
  clpDesdeUf,
  formatearRango,
  formatearTipoProyecto,
  type ProyectoCatalogoItem,
} from '../../utils/catalogoProyecto'
import { useValorUf } from '../../composables/useValorUf'
import BotonFavoritoProyecto from './BotonFavoritoProyecto.vue'
import isotipoUrl from '../../assets/UrbanSphere-Isotipo.png'

const props = defineProps<{
  prop: ProyectoCatalogoItem
}>()

const emit = defineEmits<{
  favoritoCambiado: [id: number, eraFavorito: boolean]
}>()

const { valorUf, cargarValorUf } = useValorUf()

const precioClp = computed(() => clpDesdeUf(props.prop.precioDesdeUf, valorUf.value))

onMounted(() => {
  void cargarValorUf()
})

function onFavoritoCambiado(eraFavorito: boolean) {
  emit('favoritoCambiado', props.prop.id, eraFavorito)
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row group hover:border-[#003399] transition-colors">
    <div class="w-full sm:w-2/5 h-40 sm:h-auto min-h-[140px] relative bg-slate-100 sm:border-r border-slate-100 overflow-hidden">
      <img
        v-if="prop.urlPortada"
        :src="prop.urlPortada"
        :alt="prop.titulo"
        loading="lazy"
        decoding="async"
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
        <p v-if="precioClp" class="text-xs font-semibold text-slate-500 mt-0.5">{{ formatearPrecioClp(precioClp) }}</p>
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
        <BotonFavoritoProyecto :proyecto-id="prop.id" @cambio="onFavoritoCambiado" />
      </div>
    </div>
  </div>
</template>
