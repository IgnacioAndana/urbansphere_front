<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import ProyectoTabsNav from '../../../components/admin/proyectos/ProyectoTabsNav.vue'
import ProyectoEstadoBadge from '../../../components/admin/proyectos/ProyectoEstadoBadge.vue'
import { proyectosService } from '../../../services/proyectos'
import type { Proyecto } from '../../../types/proyectos'
import { obtenerMensajeError } from '../../../utils/apiError'

const route = useRoute()

const proyectoId = computed(() => Number(route.params.proyectoId))
const proyecto = ref<Proyecto | null>(null)
const errorMsg = ref('')

provide('proyectoAdmin', proyecto)
provide('proyectoIdAdmin', proyectoId)

onMounted(async () => {
  if (Number.isNaN(proyectoId.value)) return
  try {
    proyecto.value = await proyectosService.obtenerPorId(proyectoId.value)
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo cargar el proyecto.')
  }
})
</script>

<template>
  <AdminLayout titulo="Proyecto">
    <div class="max-w-6xl mx-auto flex flex-col gap-4">
      <router-link to="/admin/proyectos" class="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#003399] w-fit">
        <ArrowLeft class="w-4 h-4" /> Listado de proyectos
      </router-link>

      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{{ errorMsg }}</div>

      <div v-if="proyecto" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900">{{ proyecto.titulo }}</h1>
          <p class="text-sm text-slate-500">{{ proyecto.comuna }} · {{ proyecto.direccion }}</p>
        </div>
        <ProyectoEstadoBadge :estado="proyecto.estado" />
      </div>

      <ProyectoTabsNav v-if="!Number.isNaN(proyectoId)" :proyecto-id="proyectoId" />

      <router-view />
    </div>
  </AdminLayout>
</template>
