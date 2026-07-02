<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { FolderPlus, Pencil, Trash2, Layers, Image, Dumbbell } from 'lucide-vue-next'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import ConfirmModal from '../../../components/ConfirmModal.vue'
import ProyectoEstadoBadge from '../../../components/admin/proyectos/ProyectoEstadoBadge.vue'
import { proyectosService } from '../../../services/proyectos'
import type { Proyecto } from '../../../types/proyectos'
import { obtenerMensajeError } from '../../../utils/apiError'

const router = useRouter()

const proyectos = ref<Proyecto[]>([])
const cargando = ref(true)
const errorMsg = ref('')
const proyectoAEliminar = ref<Proyecto | null>(null)
const eliminando = ref(false)

const proyectosOrdenados = computed(() =>
  [...proyectos.value].sort((a, b) => a.id - b.id),
)

async function cargarLista() {
  cargando.value = true
  errorMsg.value = ''
  try {
    proyectos.value = await proyectosService.listar()
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      errorMsg.value =
        'No se pudo acceder a proyectos: verifica JWT_SECRET compartido entre microservicios y que el BFF reenvíe Authorization.'
    } else {
      errorMsg.value = obtenerMensajeError(error, 'Error al cargar proyectos.')
    }
  } finally {
    cargando.value = false
  }
}

onMounted(cargarLista)

function formatDate(dateString?: string) {
  if (!dateString) return 'Sin fecha'
  return new Date(dateString).toLocaleDateString('es-CL')
}

function irEditar(id: number) {
  router.push({ name: 'admin-proyecto-editar', params: { proyectoId: id } })
}

function solicitarEliminar(p: Proyecto) {
  proyectoAEliminar.value = p
}

async function confirmarEliminar() {
  const p = proyectoAEliminar.value
  if (!p) return
  eliminando.value = true
  try {
    await proyectosService.eliminar(p.id)
    proyectoAEliminar.value = null
    await cargarLista()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo eliminar el proyecto.')
  } finally {
    eliminando.value = false
  }
}
</script>

<template>
  <AdminLayout titulo="Proyectos">
    <div class="max-w-6xl mx-auto flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">Proyectos</h1>
          <p class="text-slate-500 text-sm mt-1">Crea un proyecto y luego configura tipologías, imágenes y equipamiento.</p>
        </div>
        <router-link
          to="/admin/proyectos/nuevo"
          class="w-full sm:w-auto bg-[#003399] hover:bg-blue-800 text-white font-bold text-sm px-4 py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
        >
          <FolderPlus class="w-4 h-4" /> Nuevo proyecto
        </router-link>
      </div>

      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        {{ errorMsg }}
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th class="p-4 w-14">N°</th>
                <th class="p-4">Título</th>
                <th class="p-4">Comuna</th>
                <th class="p-4">Entrega</th>
                <th class="p-4">Estado</th>
                <th class="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-if="cargando">
                <td colspan="6" class="p-8 text-center text-slate-400">Cargando...</td>
              </tr>
              <tr v-else-if="proyectosOrdenados.length === 0">
                <td colspan="6" class="p-8 text-center text-slate-400">No hay proyectos. Crea el primero.</td>
              </tr>
              <tr v-for="(p, index) in proyectosOrdenados" :key="p.id" class="hover:bg-slate-50">
                <td class="p-4 text-slate-500 tabular-nums">{{ index + 1 }}</td>
                <td class="p-4 font-bold text-slate-800">{{ p.titulo }}</td>
                <td class="p-4 text-slate-600">{{ p.comuna }}</td>
                <td class="p-4 text-slate-600">{{ formatDate(p.fechaEntregaEstimada) }}</td>
                <td class="p-4"><ProyectoEstadoBadge :estado="p.estado" /></td>
                <td class="p-4">
                  <div class="flex items-center justify-end gap-1 flex-wrap">
                    <button type="button" title="Editar datos" class="p-1.5 text-slate-400 hover:text-[#003399] hover:bg-blue-50 rounded" @click="irEditar(p.id)">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <router-link :to="`/admin/proyectos/${p.id}/tipologias`" title="Tipologías" class="p-1.5 text-slate-400 hover:text-[#003399] hover:bg-blue-50 rounded">
                      <Layers class="w-4 h-4" />
                    </router-link>
                    <router-link :to="`/admin/proyectos/${p.id}/imagenes`" title="Imágenes" class="p-1.5 text-slate-400 hover:text-[#003399] hover:bg-blue-50 rounded">
                      <Image class="w-4 h-4" />
                    </router-link>
                    <router-link :to="`/admin/proyectos/${p.id}/equipamiento`" title="Equipamiento" class="p-1.5 text-slate-400 hover:text-[#003399] hover:bg-blue-50 rounded">
                      <Dumbbell class="w-4 h-4" />
                    </router-link>
                    <button type="button" title="Eliminar" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" @click="solicitarEliminar(p)">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        :abierto="proyectoAEliminar !== null"
        titulo="Eliminar proyecto"
        :mensaje="proyectoAEliminar ? `¿Eliminar «${proyectoAEliminar.titulo}»? Se borrarán tipologías e imágenes asociadas.` : ''"
        confirmar-texto="Eliminar"
        peligro
        :cargando="eliminando"
        @confirmar="confirmarEliminar"
        @cancelar="proyectoAEliminar = null"
      />
    </div>
  </AdminLayout>
</template>
