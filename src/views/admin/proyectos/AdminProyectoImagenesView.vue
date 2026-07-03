<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Trash2, Star } from 'lucide-vue-next'
import { imagenesProyectoService } from '../../../services/proyectos'
import type { ProyectoImagen } from '../../../types/proyectos'
import { obtenerMensajeError } from '../../../utils/apiError'
import { obtenerMensajeErrorSubidaImagen, textoLimiteImagen, validarArchivoImagen } from '../../../utils/uploadImagen'
import { ordenarImagenes } from '../../../utils/imagenesGaleria'

const route = useRoute()
const proyectoId = computed(() => Number(route.params.proyectoId))

const imagenes = ref<ProyectoImagen[]>([])
const cargando = ref(true)
const subiendo = ref(false)
const errorMsg = ref('')

const imagenesOrdenadas = computed(() => ordenarImagenes(imagenes.value))

onMounted(cargar)

async function cargar() {
  cargando.value = true
  errorMsg.value = ''
  try {
    imagenes.value = await imagenesProyectoService.listar(proyectoId.value)
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudieron cargar las imágenes.')
  } finally {
    cargando.value = false
  }
}

async function subir(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const errorValidacion = validarArchivoImagen(file)
  if (errorValidacion) {
    errorMsg.value = errorValidacion
    input.value = ''
    return
  }

  subiendo.value = true
  errorMsg.value = ''
  try {
    await imagenesProyectoService.subirArchivo(proyectoId.value, file, {
      etiqueta: 'galeria',
    })
    await cargar()
    input.value = ''
  } catch (error) {
    errorMsg.value = obtenerMensajeErrorSubidaImagen(error)
  } finally {
    subiendo.value = false
  }
}

async function marcarPortada(img: ProyectoImagen) {
  if (img.esPortada) return
  errorMsg.value = ''
  try {
    await imagenesProyectoService.actualizar(proyectoId.value, img.id, { esPortada: true })
    await cargar()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo marcar como portada.')
  }
}

async function eliminar(img: ProyectoImagen) {
  errorMsg.value = ''
  try {
    await imagenesProyectoService.eliminar(proyectoId.value, img.id)
    await cargar()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo eliminar.')
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-sm text-slate-600 leading-relaxed">
      Galería del proyecto. Solo hay <strong>una imagen portada</strong>: la primera subida queda como portada automáticamente.
      Puedes marcar otra como principal; si eliminas la portada, el backend asigna la imagen más antigua restante.
    </p>
    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{{ errorMsg }}</div>

    <label class="block w-full max-w-md border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500 cursor-pointer hover:border-[#003399] bg-white">
      <input type="file" accept="image/*" class="hidden" :disabled="subiendo" @change="subir" />
      <span class="block">{{ subiendo ? 'Subiendo a S3...' : 'Agregar imagen' }}</span>
      <span class="block text-[11px] text-slate-400 mt-1">{{ textoLimiteImagen() }}</span>
    </label>

    <div v-if="cargando" class="text-slate-400 text-sm py-8 text-center">Cargando galería...</div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="img in imagenesOrdenadas"
        :key="img.id"
        class="relative group bg-white rounded-xl border overflow-hidden"
        :class="img.esPortada ? 'border-[#003399] ring-2 ring-[#003399]/20' : 'border-slate-200'"
      >
        <img :src="img.urlS3" alt="Proyecto" class="w-full h-36 object-cover" />
        <div class="p-2 flex items-center justify-between gap-1">
          <span v-if="img.esPortada" class="text-[10px] font-bold text-[#003399] uppercase">Portada</span>
          <span v-else class="text-[10px] text-slate-400 truncate">{{ img.etiqueta || 'Galería' }}</span>
          <div class="flex gap-1 ml-auto">
            <button
              v-if="!img.esPortada"
              type="button"
              title="Marcar como portada"
              class="p-1 text-slate-400 hover:text-amber-500"
              @click="marcarPortada(img)"
            >
              <Star class="w-4 h-4" />
            </button>
            <button type="button" title="Eliminar" class="p-1 text-slate-400 hover:text-red-600" @click="eliminar(img)">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!cargando && imagenes.length === 0" class="text-sm text-slate-400">No hay imágenes. Sube la primera foto del proyecto.</p>
  </div>
</template>
