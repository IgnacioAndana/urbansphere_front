<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { FileText, Layers, Image, Dumbbell } from 'lucide-vue-next'

const props = defineProps<{
  proyectoId: number
}>()

const route = useRoute()

const tabs = computed(() => [
  { name: 'Datos generales', to: `/admin/proyectos/${props.proyectoId}/editar`, icon: FileText, suffix: 'editar' },
  { name: 'Tipologías', to: `/admin/proyectos/${props.proyectoId}/tipologias`, icon: Layers, suffix: 'tipologias' },
  { name: 'Imágenes', to: `/admin/proyectos/${props.proyectoId}/imagenes`, icon: Image, suffix: 'imagenes' },
  { name: 'Equipamiento', to: `/admin/proyectos/${props.proyectoId}/equipamiento`, icon: Dumbbell, suffix: 'equipamiento' },
])

const esActivo = (suffix: string) => route.path.endsWith(`/${suffix}`)
</script>

<template>
  <nav class="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
      :class="esActivo(tab.suffix)
        ? 'bg-[#003399] text-white shadow-sm'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
    >
      <component :is="tab.icon" class="w-4 h-4" />
      {{ tab.name }}
    </router-link>
  </nav>
</template>
