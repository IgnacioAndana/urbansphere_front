<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MapPin, Bed, Bath, Maximize, Calendar, ChevronRight, Heart } from 'lucide-vue-next'
import PublicLayout from '../layouts/PublicLayout.vue'
import FormularioMeInteresa from '../components/catalogo/FormularioMeInteresa.vue'
import { catalogoService, imagenesTipologiaService } from '../services/proyectos'
import type { ProyectoDetallePublico } from '../services/proyectos/catalogoService'
import type { TipologiaImagen } from '../types/proyectos'
import { obtenerMensajeError } from '../utils/apiError'
import {
  formatearPrecioUf,
  formatearRango,
  formatearTipoProyecto,
} from '../utils/catalogoProyecto'
import { ordenarImagenes } from '../utils/imagenesGaleria'
import { EQUIPAMIENTO_OPCIONES } from '../types/proyectos'
import { useFavoritos } from '../composables/useFavoritos'
import { authService } from '../services/usuarios'
import { esUsuarioEstandar } from '../constants/roles'
import isotipoUrl from '../assets/UrbanSphere-Isotipo.png'

const route = useRoute()
const proyectoId = computed(() => Number(route.params.id))

const detalle = ref<ProyectoDetallePublico | null>(null)
const cargando = ref(true)
const errorMsg = ref('')

const { puedeUsarFavoritos, esFavorito, cargarFavoritos, alternarFavorito } = useFavoritos()

const imagenesOrdenadas = computed(() =>
  detalle.value ? ordenarImagenes(detalle.value.imagenes) : [],
)

const imagenProyectoActivaId = ref<number | null>(null)

const imagenProyectoActiva = computed(() =>
  imagenesOrdenadas.value.find((img) => img.id === imagenProyectoActivaId.value) ?? null,
)

const tipologiaSeleccionadaId = ref<number | null>(null)
const imagenesPorTipologia = ref<Map<number, TipologiaImagen[]>>(new Map())
const cargandoImagenesTipologia = ref(false)
const imagenTipologiaActivaId = ref<number | null>(null)

const tipologiaSeleccionada = computed(() =>
  detalle.value?.tipologias.find((t) => t.id === tipologiaSeleccionadaId.value) ?? null,
)

const imagenesTipologiaOrdenadas = computed(() => {
  if (!tipologiaSeleccionadaId.value) return []
  return imagenesPorTipologia.value.get(tipologiaSeleccionadaId.value) ?? []
})

const imagenTipologiaActiva = computed(() =>
  imagenesTipologiaOrdenadas.value.find((img) => img.id === imagenTipologiaActivaId.value) ?? null,
)

const equipamientoActivo = computed(() => {
  if (!detalle.value?.equipamiento) return []
  const eq = detalle.value.equipamiento
  return EQUIPAMIENTO_OPCIONES.filter((op) => eq[op.key])
})

const anioEntrega = computed(() => {
  const fecha = detalle.value?.proyecto.fechaEntregaEstimada
  if (!fecha) return '—'
  const anio = new Date(fecha).getFullYear()
  return Number.isNaN(anio) ? '—' : String(anio)
})

const mostrarSidebarInteres = computed(() => {
  if (!authService.estaAutenticado()) return true
  return esUsuarioEstandar(authService.obtenerRolIdLocal())
})

function seleccionarImagenProyecto(id: number) {
  imagenProyectoActivaId.value = id
}

function seleccionarImagenTipologia(id: number) {
  imagenTipologiaActivaId.value = id
}

function fijarImagenProyectoPorDefecto() {
  const imgs = imagenesOrdenadas.value
  if (!imgs.length) {
    imagenProyectoActivaId.value = null
    return
  }
  const actualValida = imgs.some((i) => i.id === imagenProyectoActivaId.value)
  if (!actualValida) {
    const portada = imgs.find((i) => i.esPortada) ?? imgs[0]
    imagenProyectoActivaId.value = portada.id
  }
}

function fijarImagenTipologiaPorDefecto(tipologiaId: number) {
  const imgs = imagenesPorTipologia.value.get(tipologiaId) ?? []
  if (!imgs.length) {
    imagenTipologiaActivaId.value = null
    return
  }
  const portada = imgs.find((i) => i.esPortada) ?? imgs[0]
  imagenTipologiaActivaId.value = portada.id
}

async function cargarImagenesTipologia(tipologiaId: number) {
  if (imagenesPorTipologia.value.has(tipologiaId)) {
    fijarImagenTipologiaPorDefecto(tipologiaId)
    return
  }
  cargandoImagenesTipologia.value = true
  try {
    const imgs = await imagenesTipologiaService.listar(proyectoId.value, tipologiaId)
    imagenesPorTipologia.value.set(tipologiaId, ordenarImagenes(imgs))
    fijarImagenTipologiaPorDefecto(tipologiaId)
  } catch {
    imagenesPorTipologia.value.set(tipologiaId, [])
    imagenTipologiaActivaId.value = null
  } finally {
    cargandoImagenesTipologia.value = false
  }
}

function seleccionarTipologia(id: number) {
  if (tipologiaSeleccionadaId.value === id) return
  tipologiaSeleccionadaId.value = id
}

watch(imagenesOrdenadas, fijarImagenProyectoPorDefecto, { immediate: true })

watch(
  () => detalle.value?.tipologias,
  (tips) => {
    if (!tips?.length) {
      tipologiaSeleccionadaId.value = null
      return
    }
    if (!tips.some((t) => t.id === tipologiaSeleccionadaId.value)) {
      tipologiaSeleccionadaId.value = tips[0].id
    }
  },
  { immediate: true },
)

watch(tipologiaSeleccionadaId, (id) => {
  if (id != null) void cargarImagenesTipologia(id)
})

async function cargar() {
  if (Number.isNaN(proyectoId.value)) {
    errorMsg.value = 'Proyecto no válido.'
    cargando.value = false
    return
  }
  cargando.value = true
  errorMsg.value = ''
  imagenesPorTipologia.value = new Map()
  tipologiaSeleccionadaId.value = null
  imagenProyectoActivaId.value = null
  try {
    detalle.value = await catalogoService.obtenerDetalle(proyectoId.value)
    if (!detalle.value) {
      errorMsg.value = 'Proyecto no encontrado o no disponible.'
    }
    await cargarFavoritos()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo cargar el proyecto.')
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
watch(proyectoId, cargar)
</script>

<template>
  <PublicLayout>
    <div class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <router-link to="/catalogo" class="hover:text-[#003399] transition-colors">Catálogo</router-link>
        <ChevronRight class="w-4 h-4" />
        <span class="text-slate-400 truncate">{{ detalle?.proyecto.titulo ?? 'Detalle' }}</span>
      </div>
    </div>

    <div v-if="cargando" class="py-24 text-center text-slate-400">Cargando proyecto...</div>
    <div v-else-if="errorMsg || !detalle" class="py-24 text-center">
      <p class="text-red-600 font-medium">{{ errorMsg || 'Proyecto no disponible.' }}</p>
      <router-link to="/catalogo" class="inline-block mt-4 text-[#003399] font-bold text-sm">Volver al catálogo</router-link>
    </div>

    <div v-else class="bg-slate-50 min-h-[calc(100vh-130px)]">
      <div class="max-w-7xl mx-auto p-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
        <div :class="mostrarSidebarInteres ? 'lg:col-span-8' : 'lg:col-span-12'" class="flex flex-col gap-8">
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <span class="text-xs bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded uppercase">En venta</span>
                <span class="text-xs bg-blue-100 text-[#003399] font-black px-3 py-1 rounded uppercase">
                  {{ formatearTipoProyecto(detalle.proyecto.tipo) }}
                </span>
              </div>
              <h1 class="text-4xl font-black text-slate-900 leading-tight">{{ detalle.proyecto.titulo }}</h1>
              <p class="text-slate-500 font-medium mt-2 flex items-center gap-2">
                <MapPin class="w-5 h-5 text-slate-400" />
                {{ detalle.proyecto.direccion }}, {{ detalle.proyecto.comuna }}
              </p>
            </div>
            <div class="text-left md:text-right">
              <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Precio desde</p>
              <p class="text-4xl font-black text-[#003399]">{{ formatearPrecioUf(detalle.catalogo.precioDesdeUf) }}</p>
              <div v-if="puedeUsarFavoritos" class="flex justify-start md:justify-end mt-4">
                <button
                  type="button"
                  class="w-10 h-10 rounded-full bg-white border flex items-center justify-center transition-all shadow-sm"
                  :class="esFavorito(detalle.proyecto.id) ? 'border-red-200 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400 hover:text-red-500'"
                  @click="alternarFavorito(Number(detalle.proyecto.id))"
                >
                  <Heart class="w-5 h-5" :class="esFavorito(detalle.proyecto.id) ? 'fill-current' : ''" />
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
              <Bed class="w-6 h-6 text-[#003399] mb-2" />
              <span class="font-black text-lg">{{ formatearRango(detalle.catalogo.dormitoriosMin, detalle.catalogo.dormitoriosMax) }}</span>
              <span class="text-xs text-slate-500 uppercase font-bold">Dormitorios</span>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
              <Bath class="w-6 h-6 text-[#003399] mb-2" />
              <span class="font-black text-lg">{{ formatearRango(detalle.catalogo.banosMin, detalle.catalogo.banosMax) }}</span>
              <span class="text-xs text-slate-500 uppercase font-bold">Baños</span>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
              <Maximize class="w-6 h-6 text-[#003399] mb-2" />
              <span class="font-black text-lg">{{ formatearRango(detalle.catalogo.superficieMin, detalle.catalogo.superficieMax, ' m²') }}</span>
              <span class="text-xs text-slate-500 uppercase font-bold">Superficie</span>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
              <Calendar class="w-6 h-6 text-[#003399] mb-2" />
              <span class="font-black text-lg">{{ anioEntrega }}</span>
              <span class="text-xs text-slate-500 uppercase font-bold">Entrega</span>
            </div>
          </div>

          <!-- Galería del proyecto -->
          <div class="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <img
              v-if="imagenProyectoActiva"
              :src="imagenProyectoActiva.urlS3"
              :alt="detalle.proyecto.titulo"
              class="w-full h-[320px] sm:h-[420px] object-cover"
            />
            <div v-else class="h-[320px] sm:h-[420px] flex items-center justify-center bg-slate-100">
              <img :src="isotipoUrl" alt="" class="w-32 h-32 opacity-30 object-contain" />
            </div>
            <div v-if="imagenesOrdenadas.length > 1" class="p-4 flex gap-2 overflow-x-auto">
              <button
                v-for="img in imagenesOrdenadas"
                :key="img.id"
                type="button"
                class="shrink-0 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#003399]"
                :class="img.id === imagenProyectoActivaId ? 'border-[#003399] ring-2 ring-blue-100' : 'border-slate-200 opacity-70 hover:opacity-100'"
                @click="seleccionarImagenProyecto(img.id)"
              >
                <img :src="img.urlS3" alt="Miniatura" class="w-20 h-20 object-cover" />
              </button>
            </div>
          </div>

          <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 class="text-2xl font-black text-slate-900 mb-4">Acerca de este proyecto</h3>
            <p class="text-slate-600 leading-relaxed whitespace-pre-line">{{ detalle.proyecto.descripcion }}</p>
          </div>

          <!-- Tipologías con selector e imágenes -->
          <div v-if="detalle.tipologias.length" class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 class="text-xl font-black text-slate-900 mb-2">Tipologías disponibles</h3>
            <p class="text-sm text-slate-500 mb-4">Selecciona un código para ver sus imágenes.</p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-xs uppercase text-slate-500 border-b">
                    <th class="pb-2 pr-4">Código</th>
                    <th class="pb-2 pr-4">Dorms.</th>
                    <th class="pb-2 pr-4">Baños</th>
                    <th class="pb-2 pr-4">m²</th>
                    <th class="pb-2">UF</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="t in detalle.tipologias"
                    :key="t.id"
                    class="cursor-pointer transition-colors"
                    :class="t.id === tipologiaSeleccionadaId ? 'bg-blue-50' : 'hover:bg-slate-50'"
                    @click="seleccionarTipologia(t.id)"
                  >
                    <td class="py-3 pr-4 font-bold" :class="t.id === tipologiaSeleccionadaId ? 'text-[#003399]' : ''">
                      {{ t.codigoTipologia }}
                    </td>
                    <td class="py-3 pr-4">{{ t.dormitorios }}</td>
                    <td class="py-3 pr-4">{{ t.banos }}</td>
                    <td class="py-3 pr-4">{{ t.superficieM2 }}</td>
                    <td class="py-3 font-bold text-[#003399]">{{ formatearPrecioUf(t.valorEnUf) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="tipologiaSeleccionada" class="mt-6 pt-6 border-t border-slate-100">
              <h4 class="text-sm font-black text-slate-800 mb-3">
                Imágenes — {{ tipologiaSeleccionada.codigoTipologia }}
              </h4>
              <div v-if="cargandoImagenesTipologia" class="text-sm text-slate-400 py-8 text-center">
                Cargando imágenes...
              </div>
              <template v-else-if="imagenesTipologiaOrdenadas.length">
                <img
                  v-if="imagenTipologiaActiva"
                  :src="imagenTipologiaActiva.urlS3"
                  :alt="`Tipología ${tipologiaSeleccionada.codigoTipologia}`"
                  class="w-full max-h-[360px] object-contain bg-slate-50 rounded-xl border border-slate-200"
                />
                <div v-if="imagenesTipologiaOrdenadas.length > 1" class="mt-3 flex gap-2 overflow-x-auto">
                  <button
                    v-for="img in imagenesTipologiaOrdenadas"
                    :key="img.id"
                    type="button"
                    class="shrink-0 rounded-lg overflow-hidden border-2 transition-all focus:outline-none"
                    :class="img.id === imagenTipologiaActivaId ? 'border-[#003399]' : 'border-slate-200 opacity-70 hover:opacity-100'"
                    @click="seleccionarImagenTipologia(img.id)"
                  >
                    <img :src="img.urlS3" alt="Miniatura tipología" class="w-16 h-16 object-cover" />
                  </button>
                </div>
              </template>
              <p v-else class="text-sm text-slate-400 py-4">Esta tipología aún no tiene imágenes.</p>
            </div>
          </div>

          <div v-if="equipamientoActivo.length" class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 class="text-xl font-black text-slate-900 mb-4">Equipamiento</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in equipamientoActivo"
                :key="item.key"
                class="text-xs font-bold bg-blue-50 text-[#003399] px-3 py-1.5 rounded-full"
              >
                {{ item.label }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="mostrarSidebarInteres" class="lg:col-span-4">
          <FormularioMeInteresa
            :proyecto-id="Number(detalle.proyecto.id)"
            :titulo-proyecto="detalle.proyecto.titulo"
          />
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
