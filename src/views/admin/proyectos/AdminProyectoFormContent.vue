<script setup lang="ts">
import { Sparkles, Save } from 'lucide-vue-next'
import ProyectoMapPicker from '../../../components/admin/proyectos/ProyectoMapPicker.vue'
import { useProyectoForm } from '../../../composables/useProyectoForm'
import { fechaMinimaHoyLocal } from '../../../utils/validacionesProyecto'

const fechaMinimaEntrega = fechaMinimaHoyLocal()

const {
  esEdicion,
  titulo,
  direccion,
  comuna,
  fechaEntregaEstimada,
  estado,
  latitud,
  longitud,
  descripcion,
  cargando,
  guardando,
  errorMsg,
  avisoIa,
  generandoIa,
  geminiDisponible,
  redactarConIa,
  guardar,
} = useProyectoForm()
</script>

<template>
  <div v-if="cargando" class="text-sm text-slate-500 py-8 text-center">Cargando proyecto...</div>

  <form v-else @submit.prevent="guardar" class="flex flex-col gap-6">
    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
      {{ errorMsg }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <h3 class="text-sm font-bold text-slate-800">Información general</h3>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Título *</label>
          <input v-model="titulo" type="text" required placeholder="Ej: Edificio Vista Parque" class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección *</label>
          <input v-model="direccion" type="text" required placeholder="Ej: Av. Providencia 1234" class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Comuna *</label>
            <input v-model="comuna" type="text" required placeholder="Ej: Providencia" class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha entrega</label>
            <input
              v-model="fechaEntregaEstimada"
              type="date"
              :min="fechaMinimaEntrega"
              class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white text-slate-600"
            />
            <p class="text-[10px] text-slate-400 mt-1">No se permiten fechas anteriores a hoy.</p>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
          <select v-model="estado" class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white">
            <option value="borrador">Borrador</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>
      </div>

      <div class="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 class="text-sm font-bold text-slate-800 mb-4">Geolocalización</h3>
        <ProyectoMapPicker v-model:latitud="latitud" v-model:longitud="longitud" />
      </div>
    </div>

    <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h3 class="text-sm font-bold text-slate-800">Descripción comercial</h3>
          <p class="text-xs text-slate-500 mt-1">Las tipologías, imágenes y equipamiento se configuran después de crear el proyecto.</p>
        </div>
        <button
          type="button"
          :disabled="generandoIa"
          class="shrink-0 bg-slate-50 border border-slate-200 hover:border-amber-400 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          @click="redactarConIa"
        >
          <Sparkles class="w-4 h-4 text-amber-500" />
          {{ generandoIa ? 'Generando...' : (geminiDisponible ? 'Redactar con Gemini' : 'Borrador demo') }}
        </button>
      </div>

      <div v-if="avisoIa" class="text-xs rounded-xl p-3" :class="avisoIa.includes('demo') || avisoIa.includes('Modo') ? 'text-amber-800 bg-amber-50 border border-amber-200' : 'text-emerald-800 bg-emerald-50 border border-emerald-200'">
        {{ avisoIa }}
      </div>

      <textarea
        v-model="descripcion"
        rows="6"
        required
        placeholder="Descripción para el catálogo público..."
        class="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm focus:outline-none focus:border-[#003399] focus:bg-white resize-y min-h-[140px]"
      />
    </div>

    <div class="flex justify-end gap-3">
      <button
        type="submit"
        :disabled="guardando"
        class="px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#003399] hover:bg-blue-800 shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        <Save class="w-4 h-4" />
        {{ guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear proyecto') }}
      </button>
    </div>
  </form>
</template>
