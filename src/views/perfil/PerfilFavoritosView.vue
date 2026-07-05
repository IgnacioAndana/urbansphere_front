<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { HeartOff } from 'lucide-vue-next'
import ProyectoCatalogoCard from '../../components/catalogo/ProyectoCatalogoCard.vue'
import { catalogoService } from '../../services/proyectos'
import { useFavoritos } from '../../composables/useFavoritos'
import { obtenerMensajeError } from '../../utils/apiError'
import type { ProyectoCatalogoItem } from '../../utils/catalogoProyecto'

const proyectos = ref<ProyectoCatalogoItem[]>([])
const cargando = ref(true)
const errorMsg = ref('')
const quitandoId = ref<number | null>(null)

const { cargarFavoritos } = useFavoritos()

async function cargar() {
  cargando.value = true
  errorMsg.value = ''
  try {
    await cargarFavoritos()
    proyectos.value = await catalogoService.listarFavoritosUsuario()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudieron cargar tus favoritos.')
  } finally {
    cargando.value = false
  }
}

async function quitarFavorito(id: number, eraFavorito: boolean) {
  if (!eraFavorito) return
  quitandoId.value = id
  try {
    proyectos.value = proyectos.value.filter((p) => p.id !== id)
  } finally {
    quitandoId.value = null
  }
}

onMounted(cargar)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="errorMsg" class="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
      {{ errorMsg }}
    </div>

    <div v-if="cargando" class="text-center text-slate-400 py-16">Cargando favoritos...</div>

    <template v-else-if="proyectos.length === 0">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <HeartOff class="w-8 h-8 text-slate-300" />
        </div>
        <div>
          <h2 class="font-black text-lg text-slate-800">Sin favoritos aún</h2>
          <p class="text-sm text-slate-500 mt-1 max-w-sm">
            Marca propiedades con el corazón en el catálogo para verlas aquí.
          </p>
        </div>
        <router-link
          to="/catalogo"
          class="px-6 py-2.5 bg-[#003399] text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors"
        >
          Explorar catálogo
        </router-link>
      </div>
    </template>

    <template v-else>
      <p class="text-sm text-slate-500 font-medium">{{ proyectos.length }} propiedad(es) guardada(s)</p>
      <ProyectoCatalogoCard
        v-for="prop in proyectos"
        :key="prop.id"
        :prop="prop"
        :class="{ 'opacity-60 pointer-events-none': quitandoId === prop.id }"
        @favorito-cambiado="quitarFavorito"
      />
    </template>
  </div>
</template>
