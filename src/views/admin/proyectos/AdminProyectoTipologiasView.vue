<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Pencil, Trash2, Image, X, Star } from 'lucide-vue-next'
import ConfirmModal from '../../../components/ConfirmModal.vue'
import { tipologiasService, imagenesTipologiaService } from '../../../services/proyectos'
import type { CrearTipologiaDto, Tipologia, TipologiaImagen } from '../../../types/proyectos'
import { obtenerMensajeError } from '../../../utils/apiError'
import { obtenerMensajeErrorSubidaImagen, textoLimiteImagen, validarArchivoImagen } from '../../../utils/uploadImagen'
import { validarTipologiaForm, normalizarTipologiaDto } from '../../../utils/validacionesProyecto'
import { ordenarImagenes } from '../../../utils/imagenesGaleria'

const route = useRoute()
const proyectoId = computed(() => Number(route.params.proyectoId))

const tipologias = ref<Tipologia[]>([])
const cargando = ref(true)
const errorMsg = ref('')
const exitoMsg = ref('')

const modalAbierto = ref(false)
const modoEdicion = ref(false)
const tipologiaEdicionId = ref<number | null>(null)
const guardando = ref(false)
const formError = ref('')

const form = ref<CrearTipologiaDto>({
  codigoTipologia: '',
  dormitorios: 1,
  banos: 1,
  superficieM2: 30,
  valorEnUf: 2000,
})

const tipologiaAEliminar = ref<Tipologia | null>(null)
const eliminando = ref(false)

const modalImagenes = ref(false)
const tipologiaImagenes = ref<Tipologia | null>(null)
const imagenes = ref<TipologiaImagen[]>([])
const cargandoImagenes = ref(false)
const subiendoImagen = ref(false)
const errorImagenesModal = ref('')

const imagenesOrdenadas = computed(() => ordenarImagenes(imagenes.value))

onMounted(async () => {
  if (route.query.creado === '1') {
    exitoMsg.value = 'Proyecto creado. Ahora agrega las tipologías (modelos de unidad).'
  }
  await cargarLista()
})

async function cargarLista() {
  cargando.value = true
  errorMsg.value = ''
  try {
    tipologias.value = await tipologiasService.listar(proyectoId.value)
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudieron cargar las tipologías.')
  } finally {
    cargando.value = false
  }
}

function abrirCrear() {
  modoEdicion.value = false
  tipologiaEdicionId.value = null
  form.value = { codigoTipologia: '', dormitorios: 1, banos: 1, superficieM2: 30, valorEnUf: 2000 }
  formError.value = ''
  modalAbierto.value = true
}

function abrirEditar(t: Tipologia) {
  modoEdicion.value = true
  tipologiaEdicionId.value = t.id
  form.value = {
    codigoTipologia: t.codigoTipologia,
    dormitorios: t.dormitorios,
    banos: t.banos,
    superficieM2: t.superficieM2,
    valorEnUf: t.valorEnUf,
  }
  formError.value = ''
  modalAbierto.value = true
}

async function guardarTipologia() {
  formError.value = ''
  const err = validarTipologiaForm(form.value)
  if (err) {
    formError.value = err
    return
  }

  const dto = normalizarTipologiaDto(form.value)
  guardando.value = true
  try {
    if (modoEdicion.value && tipologiaEdicionId.value) {
      await tipologiasService.actualizar(proyectoId.value, tipologiaEdicionId.value, dto)
    } else {
      await tipologiasService.crear(proyectoId.value, dto)
    }
    modalAbierto.value = false
    await cargarLista()
  } catch (error) {
    formError.value = obtenerMensajeError(error, 'No se pudo guardar la tipología.')
  } finally {
    guardando.value = false
  }
}

async function confirmarEliminar() {
  const t = tipologiaAEliminar.value
  if (!t) return
  eliminando.value = true
  try {
    await tipologiasService.eliminar(proyectoId.value, t.id)
    tipologiaAEliminar.value = null
    await cargarLista()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo eliminar.')
  } finally {
    eliminando.value = false
  }
}

async function abrirImagenes(t: Tipologia) {
  tipologiaImagenes.value = t
  modalImagenes.value = true
  errorImagenesModal.value = ''
  imagenes.value = []
  cargandoImagenes.value = true
  try {
    imagenes.value = await imagenesTipologiaService.listar(proyectoId.value, t.id)
  } catch (error) {
    errorImagenesModal.value = obtenerMensajeError(error, 'No se pudieron cargar las imágenes.')
  } finally {
    cargandoImagenes.value = false
  }
}

function cerrarModalImagenes() {
  modalImagenes.value = false
  errorImagenesModal.value = ''
}

async function subirImagenTipologia(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  const t = tipologiaImagenes.value
  if (!file || !t) return

  const errorValidacion = validarArchivoImagen(file)
  if (errorValidacion) {
    errorImagenesModal.value = errorValidacion
    input.value = ''
    return
  }

  subiendoImagen.value = true
  errorImagenesModal.value = ''
  try {
    await imagenesTipologiaService.subirArchivo(proyectoId.value, t.id, file)
    imagenes.value = await imagenesTipologiaService.listar(proyectoId.value, t.id)
    input.value = ''
  } catch (error) {
    errorImagenesModal.value = obtenerMensajeErrorSubidaImagen(error)
  } finally {
    subiendoImagen.value = false
  }
}

async function marcarPortadaTipologia(imagenId: number) {
  const t = tipologiaImagenes.value
  if (!t) return
  errorImagenesModal.value = ''
  try {
    await imagenesTipologiaService.actualizar(proyectoId.value, t.id, imagenId, {
      esPortada: true,
    })
    imagenes.value = await imagenesTipologiaService.listar(proyectoId.value, t.id)
  } catch (error) {
    errorImagenesModal.value = obtenerMensajeError(error, 'No se pudo marcar como portada.')
  }
}

async function eliminarImagen(imagenId: number) {
  const t = tipologiaImagenes.value
  if (!t) return
  errorImagenesModal.value = ''
  try {
    await imagenesTipologiaService.eliminar(proyectoId.value, t.id, imagenId)
    imagenes.value = await imagenesTipologiaService.listar(proyectoId.value, t.id)
  } catch (error) {
    errorImagenesModal.value = obtenerMensajeError(error, 'No se pudo eliminar la imagen.')
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="exitoMsg" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm">{{ exitoMsg }}</div>
    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{{ errorMsg }}</div>

    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <p class="text-sm text-slate-600">Modelos de unidad disponibles en este proyecto.</p>
      <button type="button" class="bg-[#003399] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer" @click="abrirCrear">
        <Plus class="w-4 h-4" /> Nueva tipología
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 text-xs uppercase font-bold text-slate-500">
              <th class="p-4 text-left">Código</th>
              <th class="p-4 text-left">Dorms.</th>
              <th class="p-4 text-left">Baños</th>
              <th class="p-4 text-left">m²</th>
              <th class="p-4 text-left">UF</th>
              <th class="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="cargando"><td colspan="6" class="p-8 text-center text-slate-400">Cargando...</td></tr>
            <tr v-else-if="tipologias.length === 0"><td colspan="6" class="p-8 text-center text-slate-400">Sin tipologías. Agrega al menos una.</td></tr>
            <tr v-for="t in tipologias" :key="t.id" class="hover:bg-slate-50">
              <td class="p-4 font-bold">{{ t.codigoTipologia }}</td>
              <td class="p-4">{{ t.dormitorios }}</td>
              <td class="p-4">{{ t.banos }}</td>
              <td class="p-4">{{ t.superficieM2 }}</td>
              <td class="p-4">{{ t.valorEnUf }}</td>
              <td class="p-4 text-right">
                <div class="flex justify-end gap-1">
                  <button type="button" title="Imágenes" class="p-1.5 text-slate-400 hover:text-[#003399] rounded" @click="abrirImagenes(t)"><Image class="w-4 h-4" /></button>
                  <button type="button" title="Editar" class="p-1.5 text-slate-400 hover:text-[#003399] rounded" @click="abrirEditar(t)"><Pencil class="w-4 h-4" /></button>
                  <button type="button" title="Eliminar" class="p-1.5 text-slate-400 hover:text-red-600 rounded" @click="tipologiaAEliminar = t"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modalAbierto" class="fixed inset-0 bg-slate-900/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <h3 class="font-black text-lg mb-4">{{ modoEdicion ? 'Editar tipología' : 'Nueva tipología' }}</h3>
          <div v-if="formError" class="mb-3 text-sm text-red-700 bg-red-50 p-3 rounded-xl">{{ formError }}</div>
          <form class="flex flex-col gap-3" @submit.prevent="guardarTipologia">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Código *</label>
              <input v-model="form.codigoTipologia" placeholder="Ej: 2D2B" required class="w-full border rounded-xl p-3 text-sm" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Dormitorios *</label>
                <input
                  v-model.number="form.dormitorios"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Ej: 2"
                  class="w-full border rounded-xl p-3 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Baños *</label>
                <input
                  v-model.number="form.banos"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Ej: 2"
                  class="w-full border rounded-xl p-3 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Superficie (m²) *</label>
                <input
                  v-model.number="form.superficieM2"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Ej: 64.5"
                  class="w-full border rounded-xl p-3 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (UF) *</label>
                <input
                  v-model.number="form.valorEnUf"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Ej: 3200"
                  class="w-full border rounded-xl p-3 text-sm"
                />
              </div>
            </div>
            <p class="text-[10px] text-slate-400 leading-relaxed">
              Dormitorios y baños: enteros ≥ 1. Superficie: decimal &gt; 0. UF: entero sin decimales.
            </p>
            <div class="flex gap-2 mt-2">
              <button type="button" class="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-sm" @click="modalAbierto = false">Cancelar</button>
              <button type="submit" :disabled="guardando" class="flex-1 py-3 rounded-xl bg-[#003399] text-white font-bold text-sm disabled:opacity-50">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="modalImagenes && tipologiaImagenes" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
          <div class="flex justify-between items-start mb-4">
            <h3 class="font-black text-lg">Imágenes — {{ tipologiaImagenes.codigoTipologia }}</h3>
            <button type="button" class="text-slate-400 hover:text-slate-700" @click="cerrarModalImagenes"><X class="w-5 h-5" /></button>
          </div>
          <div v-if="errorImagenesModal" class="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
            {{ errorImagenesModal }}
          </div>
          <p class="text-xs text-slate-500 mb-3 leading-relaxed">
            Una sola portada por tipología. La primera imagen queda como portada; al borrarla, el servidor asigna la más antigua restante.
          </p>
          <label class="block w-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-sm text-slate-500 cursor-pointer hover:border-[#003399] mb-4">
            <input type="file" accept="image/*" class="hidden" :disabled="subiendoImagen" @change="subirImagenTipologia" />
            <span class="block">{{ subiendoImagen ? 'Subiendo...' : 'Agregar imagen' }}</span>
            <span class="block text-[11px] text-slate-400 mt-1">{{ textoLimiteImagen() }}</span>
          </label>
          <div v-if="cargandoImagenes" class="text-center text-slate-400 py-4">Cargando...</div>
          <div v-else class="grid grid-cols-2 gap-3">
            <div
              v-for="img in imagenesOrdenadas"
              :key="img.id"
              class="relative group rounded-xl overflow-hidden border"
              :class="img.esPortada ? 'border-[#003399] ring-2 ring-[#003399]/20' : 'border-slate-200'"
            >
              <img :src="img.urlS3" :alt="`Tipología ${tipologiaImagenes.codigoTipologia}`" class="w-full h-28 object-cover" />
              <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  v-if="!img.esPortada"
                  type="button"
                  title="Marcar portada"
                  class="p-1 bg-white/90 rounded-full text-slate-500 hover:text-amber-500"
                  @click="marcarPortadaTipologia(img.id)"
                >
                  <Star class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Eliminar"
                  class="p-1 bg-white/90 rounded-full text-red-600"
                  @click="eliminarImagen(img.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
              <span
                v-if="img.esPortada"
                class="absolute bottom-1 left-1 text-[10px] bg-[#003399] text-white px-2 py-0.5 rounded font-bold uppercase"
              >
                Portada
              </span>
            </div>
          </div>
          <p v-if="!cargandoImagenes && imagenes.length === 0" class="text-sm text-slate-400 text-center py-4">Sin imágenes aún.</p>
        </div>
      </div>
    </Teleport>

    <ConfirmModal
      :abierto="tipologiaAEliminar !== null"
      titulo="Eliminar tipología"
      :mensaje="tipologiaAEliminar ? `¿Eliminar ${tipologiaAEliminar.codigoTipologia}?` : ''"
      confirmar-texto="Eliminar"
      peligro
      :cargando="eliminando"
      @confirmar="confirmarEliminar"
      @cancelar="tipologiaAEliminar = null"
    />
  </div>
</template>
