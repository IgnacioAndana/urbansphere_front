<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Save } from 'lucide-vue-next'
import { equipamientoService } from '../../../services/proyectos'
import { EQUIPAMIENTO_OPCIONES, type ActualizarEquipamientoDto } from '../../../types/proyectos'
import { obtenerMensajeError } from '../../../utils/apiError'

const route = useRoute()
const proyectoId = computed(() => Number(route.params.proyectoId))

const form = ref<ActualizarEquipamientoDto>({
  gimnasio: false,
  quincho: false,
  areasVerdes: false,
  bicicletero: false,
  piscina: false,
  juegosInfantiles: false,
  gourmetLounge: false,
  coworkingRoom: false,
})

const cargando = ref(true)
const guardando = ref(false)
const errorMsg = ref('')
const exitoMsg = ref('')

onMounted(async () => {
  cargando.value = true
  try {
    const data = await equipamientoService.obtener(proyectoId.value)
    const { proyectoId: _, ...flags } = data
    form.value = flags
  } catch {
    // Sin registro aún — valores por defecto en false
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  guardando.value = true
  errorMsg.value = ''
  exitoMsg.value = ''
  try {
    await equipamientoService.guardar(proyectoId.value, form.value)
    exitoMsg.value = 'Equipamiento guardado correctamente.'
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo guardar el equipamiento.')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-sm text-slate-600">Selecciona las amenidades comunes que ofrece el proyecto.</p>

    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{{ errorMsg }}</div>
    <div v-if="exitoMsg" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm">{{ exitoMsg }}</div>

    <div v-if="cargando" class="text-slate-400 text-sm py-8">Cargando...</div>

    <form v-else class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6" @submit.prevent="guardar">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label
          v-for="op in EQUIPAMIENTO_OPCIONES"
          :key="op.key"
          class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          <input v-model="form[op.key]" type="checkbox" class="w-4 h-4 accent-[#003399]" />
          <span class="text-sm font-semibold text-slate-700">{{ op.label }}</span>
        </label>
      </div>

      <div class="flex justify-end mt-6">
        <button type="submit" :disabled="guardando" class="bg-[#003399] text-white font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer">
          <Save class="w-4 h-4" /> {{ guardando ? 'Guardando...' : 'Guardar equipamiento' }}
        </button>
      </div>
    </form>
  </div>
</template>
