<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Heart, Mail, CheckCircle2, Clock, ExternalLink } from 'lucide-vue-next'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { solicitudesInteresService, solicitudesContactoService } from '../../services/usuarios'
import { proyectosService } from '../../services/proyectos'
import { useSesion } from '../../composables/useSesion'
import { obtenerMensajeError } from '../../utils/apiError'
import { formatearFechaLegible } from '../../utils/fechas'
import type { EstadoSolicitud, SolicitudContacto, SolicitudInteres } from '../../types/usuarios'

type Pestana = 'interes' | 'contacto'
type FiltroEstado = 'todas' | EstadoSolicitud

const { cargarSesion } = useSesion()

const pestana = ref<Pestana>('interes')
const filtroEstado = ref<FiltroEstado>('todas')

const listaInteres = ref<SolicitudInteres[]>([])
const listaContacto = ref<SolicitudContacto[]>([])
const titulosProyecto = ref<Map<number, string>>(new Map())

const cargando = ref(true)
const errorMsg = ref('')

const modalGestion = ref(false)
const gestionTipo = ref<Pestana>('interes')
const gestionId = ref<number | null>(null)
const gestionEstado = ref<EstadoSolicitud>('pendiente')
const gestionObservacion = ref('')
const guardandoGestion = ref(false)
const gestionError = ref('')

const estadoParam = computed((): EstadoSolicitud | undefined =>
  filtroEstado.value === 'todas' ? undefined : filtroEstado.value,
)

function etiquetaEstado(estado?: EstadoSolicitud) {
  if (estado === 'resuelta') {
    return { texto: 'Resuelta', class: 'bg-emerald-100 text-emerald-700' }
  }
  return { texto: 'Pendiente', class: 'bg-amber-100 text-amber-800' }
}

function esResuelta(item: { estado?: EstadoSolicitud }) {
  return item.estado === 'resuelta'
}

function fmtFecha(valor?: string | null) {
  return formatearFechaLegible(valor) || '—'
}

function tituloProyecto(proyectoId: number): string {
  return titulosProyecto.value.get(proyectoId) ?? `Proyecto #${proyectoId}`
}

async function enriquecerProyectos(solicitudes: SolicitudInteres[]) {
  const ids = [...new Set(solicitudes.map((s) => s.proyectoId))]
  if (!ids.length) return
  try {
    const { items } = await proyectosService.consultarCatalogo(ids)
    const mapa = new Map(titulosProyecto.value)
    items.forEach((p) => mapa.set(p.id, p.titulo))
    titulosProyecto.value = mapa
  } catch {
    /* títulos opcionales */
  }
}

async function cargarInteres() {
  listaInteres.value = await solicitudesInteresService.listar(estadoParam.value)
  await enriquecerProyectos(listaInteres.value)
}

async function cargarContacto() {
  listaContacto.value = await solicitudesContactoService.listar(estadoParam.value)
}

async function cargarDatos() {
  cargando.value = true
  errorMsg.value = ''
  try {
    if (pestana.value === 'interes') {
      await cargarInteres()
    } else {
      await cargarContacto()
    }
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudieron cargar las solicitudes.')
  } finally {
    cargando.value = false
  }
}

function abrirGestion(tipo: Pestana, item: SolicitudInteres | SolicitudContacto) {
  if (esResuelta(item)) return
  gestionTipo.value = tipo
  gestionId.value = item.id
  gestionEstado.value = 'resuelta'
  gestionObservacion.value = item.observacionAgente ?? ''
  gestionError.value = ''
  modalGestion.value = true
}

function cerrarGestion() {
  if (guardandoGestion.value) return
  modalGestion.value = false
  gestionId.value = null
}

async function guardarGestion() {
  if (gestionId.value == null) return
  guardandoGestion.value = true
  gestionError.value = ''
  const dto = {
    estado: gestionEstado.value,
    observacionAgente: gestionObservacion.value.trim() || null,
  }
  try {
    if (gestionTipo.value === 'interes') {
      await solicitudesInteresService.gestionar(gestionId.value, dto)
      await cargarInteres()
    } else {
      await solicitudesContactoService.gestionar(gestionId.value, dto)
      await cargarContacto()
    }
    modalGestion.value = false
  } catch (error) {
    gestionError.value = obtenerMensajeError(error, 'No se pudo guardar la gestión.')
  } finally {
    guardandoGestion.value = false
  }
}

onMounted(async () => {
  await cargarSesion()
  await cargarDatos()
})

watch([pestana, filtroEstado], cargarDatos)
</script>

<template>
  <AdminLayout titulo="Solicitudes">
    <div class="max-w-[90rem] mx-auto flex flex-col gap-6">
      <header>
        <h1 class="text-2xl font-black text-slate-900">Gestión de solicitudes</h1>
        <p class="text-sm text-slate-500 mt-1">
          Interés por proyecto (usuarios registrados) y contacto general (consultas externas).
        </p>
      </header>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex rounded-xl border border-slate-200 p-1 bg-white shadow-sm">
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            :class="pestana === 'interes' ? 'bg-[#003399] text-white' : 'text-slate-600 hover:bg-slate-50'"
            @click="pestana = 'interes'"
          >
            <Heart class="w-4 h-4" /> Interés por proyecto
          </button>
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            :class="pestana === 'contacto' ? 'bg-[#003399] text-white' : 'text-slate-600 hover:bg-slate-50'"
            @click="pestana = 'contacto'"
          >
            <Mail class="w-4 h-4" /> Contacto general
          </button>
        </div>

        <select
          v-model="filtroEstado"
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white sm:ml-auto"
        >
          <option value="todas">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="resuelta">Resueltas</option>
        </select>
      </div>

      <div v-if="errorMsg" class="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
        {{ errorMsg }}
      </div>

      <!-- Interés -->
      <div v-if="pestana === 'interes'" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase text-slate-500 bg-slate-50 border-b border-slate-100">
                <th class="p-4">Fecha</th>
                <th class="p-4">Proyecto</th>
                <th class="p-4">Usuario</th>
                <th class="p-4">Email</th>
                <th class="p-4">Estado</th>
                <th class="p-4">Fecha resolución</th>
                <th class="p-4">Observación agente</th>
                <th class="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="cargando">
                <td colspan="8" class="p-8 text-center text-slate-400">Cargando...</td>
              </tr>
              <tr v-else-if="listaInteres.length === 0">
                <td colspan="8" class="p-8 text-center text-slate-400">No hay solicitudes de interés.</td>
              </tr>
              <tr v-for="s in listaInteres" :key="s.id" class="hover:bg-slate-50/80">
                <td class="p-4 text-slate-600 whitespace-nowrap">{{ fmtFecha(s.creadoEn) }}</td>
                <td class="p-4">
                  <RouterLink
                    :to="`/propiedad/${s.proyectoId}`"
                    class="font-bold text-[#003399] hover:underline inline-flex items-center gap-1"
                    target="_blank"
                  >
                    {{ tituloProyecto(s.proyectoId) }}
                    <ExternalLink class="w-3 h-3 opacity-60" />
                  </RouterLink>
                </td>
                <td class="p-4 font-medium text-slate-800">{{ s.nombre }}</td>
                <td class="p-4 text-slate-600">{{ s.email }}</td>
                <td class="p-4">
                  <span
                    class="text-[10px] font-black uppercase px-2 py-1 rounded-full"
                    :class="etiquetaEstado(s.estado).class"
                  >
                    {{ etiquetaEstado(s.estado).texto }}
                  </span>
                </td>
                <td class="p-4 text-slate-600 whitespace-nowrap">{{ fmtFecha(s.fechaCierre) }}</td>
                <td class="p-4 text-slate-600 max-w-[200px]">
                  <p class="line-clamp-3 whitespace-pre-line text-xs">{{ s.observacionAgente || '—' }}</p>
                </td>
                <td class="p-4 text-right">
                  <button
                    v-if="!esResuelta(s)"
                    type="button"
                    class="text-xs font-bold text-[#003399] hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200"
                    @click="abrirGestion('interes', s)"
                  >
                    Gestionar
                  </button>
                  <span v-else class="text-xs text-slate-400 font-medium">Cerrada</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Contacto -->
      <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase text-slate-500 bg-slate-50 border-b border-slate-100">
                <th class="p-4">Fecha</th>
                <th class="p-4">Nombre</th>
                <th class="p-4">Email</th>
                <th class="p-4">Mensaje</th>
                <th class="p-4">Estado</th>
                <th class="p-4">Fecha resolución</th>
                <th class="p-4">Observación agente</th>
                <th class="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="cargando">
                <td colspan="8" class="p-8 text-center text-slate-400">Cargando...</td>
              </tr>
              <tr v-else-if="listaContacto.length === 0">
                <td colspan="8" class="p-8 text-center text-slate-400">No hay solicitudes de contacto.</td>
              </tr>
              <tr v-for="s in listaContacto" :key="s.id" class="hover:bg-slate-50/80">
                <td class="p-4 text-slate-600 whitespace-nowrap align-top">{{ fmtFecha(s.creadoEn) }}</td>
                <td class="p-4 font-medium text-slate-800 align-top">{{ s.nombreCompleto }}</td>
                <td class="p-4 text-slate-600 align-top">{{ s.email }}</td>
                <td class="p-4 text-slate-600 max-w-xs align-top">
                  <p class="line-clamp-3 whitespace-pre-line">{{ s.mensaje }}</p>
                </td>
                <td class="p-4 align-top">
                  <span
                    class="text-[10px] font-black uppercase px-2 py-1 rounded-full"
                    :class="etiquetaEstado(s.estado).class"
                  >
                    {{ etiquetaEstado(s.estado).texto }}
                  </span>
                </td>
                <td class="p-4 text-slate-600 whitespace-nowrap align-top">{{ fmtFecha(s.fechaCierre) }}</td>
                <td class="p-4 text-slate-600 max-w-[200px] align-top">
                  <p class="line-clamp-3 whitespace-pre-line text-xs">{{ s.observacionAgente || '—' }}</p>
                </td>
                <td class="p-4 text-right align-top">
                  <button
                    v-if="!esResuelta(s)"
                    type="button"
                    class="text-xs font-bold text-[#003399] hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200"
                    @click="abrirGestion('contacto', s)"
                  >
                    Gestionar
                  </button>
                  <span v-else class="text-xs text-slate-400 font-medium">Cerrada</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal gestión -->
    <Teleport to="body">
      <div
        v-if="modalGestion"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
        @click.self="cerrarGestion"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
          <div class="p-6 flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[#003399]/10 text-[#003399] flex items-center justify-center">
                <CheckCircle2 v-if="gestionEstado === 'resuelta'" class="w-5 h-5" />
                <Clock v-else class="w-5 h-5" />
              </div>
              <div>
                <h2 class="font-black text-slate-900">Gestionar solicitud</h2>
                <p class="text-xs text-slate-500">
                  {{ gestionTipo === 'interes' ? 'Interés por proyecto' : 'Contacto general' }}
                </p>
              </div>
            </div>

            <div v-if="gestionError" class="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
              {{ gestionError }}
            </div>

            <p class="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              Al marcar como resuelta se registra la fecha de cierre. La solicitud no podrá editarse después.
            </p>

            <div>
              <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estado</label>
              <select
                v-model="gestionEstado"
                class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white"
              >
                <option value="resuelta">Resuelta</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Observación del agente
              </label>
              <textarea
                v-model="gestionObservacion"
                rows="4"
                placeholder="Ej.: Se contactó al cliente y agendó visita."
                class="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-[#003399]"
              />
            </div>

            <div class="flex gap-2 pt-2">
              <button
                type="button"
                class="flex-1 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                :disabled="guardandoGestion"
                @click="cerrarGestion"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#003399] text-white hover:bg-blue-800 disabled:opacity-60"
                :disabled="guardandoGestion"
                @click="guardarGestion"
              >
                {{ guardandoGestion ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>
