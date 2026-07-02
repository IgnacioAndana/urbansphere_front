<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { Sparkles, Image as Save, Plus, Trash2, Pencil, FolderPlus } from 'lucide-vue-next';
import AdminLayout from '../layouts/AdminLayout.vue';
import { proyectosService, tipologiasService } from '../services/proyectos';
import type { CrearProyectoDto, CrearTipologiaDto, Proyecto } from '../types/proyectos';
import * as L from 'leaflet';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'leaflet/dist/leaflet.css';

// --- Listado de Proyectos ---
const proyectos = ref<Proyecto[]>([]);
const cargandoLista = ref(true);
const errorLista = ref('');

const cargarProyectos = async () => {
  cargandoLista.value = true;
  errorLista.value = '';
  try {
    proyectos.value = await proyectosService.listar();
  } catch (error: any) {
    errorLista.value = error.response?.data?.message || 'Error al cargar los proyectos. Revisa el token o la BD.';
  } finally {
    cargandoLista.value = false;
  }
};

onMounted(() => {
  cargarProyectos();
});

// --- Modal y Formulario de Nuevo Proyecto ---
const modalAbierto = ref(false);

const titulo = ref('');
const direccion = ref('');
const comuna = ref('');
const fechaEntregaEstimada = ref('');
const estado = ref('activo');
const latitud = ref(-33.4489);
const longitud = ref(-70.6693);
const descripcionIa = ref('');

const generandoIa = ref(false);
const guardando = ref(false);
const errorMsg = ref('');

const tipologias = ref<CrearTipologiaDto[]>([
  { codigoTipologia: '', dormitorios: 1, banos: 1, superficieM2: 30, valorEnUf: 2000 }
]);

const agregarTipologia = () => {
  tipologias.value.push({ codigoTipologia: '', dormitorios: 1, banos: 1, superficieM2: 30, valorEnUf: 2000 });
};

const eliminarTipologia = (index: number) => {
  tipologias.value.splice(index, 1);
};

// --- Integración Leaflet ---
let map: L.Map | null = null;
let marker: L.Marker | null = null;

const initMap = () => {
  if (map) {
    map.remove();
  }
  map = L.map('mapContainer').setView([latitud.value, longitud.value], 13);
  
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  marker = L.marker([latitud.value, longitud.value], { draggable: true, icon }).addTo(map);

  marker.on('dragend', (e) => {
    const position = e.target.getLatLng();
    latitud.value = Number(position.lat.toFixed(6));
    longitud.value = Number(position.lng.toFixed(6));
  });

  map.on('click', (e) => {
    latitud.value = Number(e.latlng.lat.toFixed(6));
    longitud.value = Number(e.latlng.lng.toFixed(6));
    marker?.setLatLng(e.latlng);
  });
};

const actualizarMapaDesdeInputs = () => {
  if (map && marker) {
    const lat = Number(latitud.value);
    const lng = Number(longitud.value);
    if (!isNaN(lat) && !isNaN(lng)) {
      const newLatLng = L.latLng(lat, lng);
      marker.setLatLng(newLatLng);
      map.setView(newLatLng);
    }
  }
};

const abrirModal = () => {
  titulo.value = '';
  direccion.value = '';
  comuna.value = '';
  fechaEntregaEstimada.value = '';
  estado.value = 'activo';
  latitud.value = -33.4489;
  longitud.value = -70.6693;
  descripcionIa.value = '';
  tipologias.value = [{ codigoTipologia: '', dormitorios: 1, banos: 1, superficieM2: 30, valorEnUf: 2000 }];
  errorMsg.value = '';
  
  modalAbierto.value = true;

  nextTick(() => {
    initMap();
  });
};

const cerrarModal = () => {
  modalAbierto.value = false;
  if (map) {
    map.remove();
    map = null;
  }
};

// --- Integración Gemini AI ---
const llamarGemini = async () => {
  if (!titulo.value) {
    alert("Por favor, ingresa al menos el título y la comuna del proyecto para que la IA tenga contexto.");
    return;
  }
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    alert("No se encontró VITE_GEMINI_API_KEY en las variables de entorno. Usando generador simulado.");
    generandoIa.value = true;
    setTimeout(() => {
      descripcionIa.value = `Descubre ${titulo.value}, un exclusivo proyecto residencial en ${comuna.value}. Diseñado bajo los más altos estándares de arquitectura moderna, ofrece terminaciones de primer nivel ideales para tu familia.`;
      generandoIa.value = false;
    }, 1500);
    return;
  }

  generandoIa.value = true;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `Actúa como un experto agente inmobiliario. Redacta una descripción comercial muy atractiva, persuasiva y elegante (aprox 2 a 3 párrafos cortos) para un nuevo proyecto inmobiliario en Chile.`;
    prompt += `\nDatos del proyecto:\n- Título: ${titulo.value}`;
    if (direccion.value) prompt += `\n- Dirección: ${direccion.value}`;
    if (comuna.value) prompt += `\n- Comuna: ${comuna.value}`;
    if (tipologias.value.length > 0) {
      prompt += `\n- Tipologías disponibles: ${tipologias.value.filter(t => t.codigoTipologia).map(t => `${t.dormitorios}D/${t.banos}B`).join(', ')}`;
    }
    prompt += `\nNo incluyas saludos ni despedidas, solo el texto comercial listo para publicar.`;

    const result = await model.generateContent(prompt);
    descripcionIa.value = result.response.text().trim();
  } catch (error) {
    console.error(error);
    alert("Ocurrió un error al contactar a la IA. Revisa tu consola y tu API Key.");
  } finally {
    generandoIa.value = false;
  }
};

const guardarProyecto = async () => {
  guardando.value = true;
  errorMsg.value = '';

  try {
    const proyectoData: CrearProyectoDto = {
      titulo: titulo.value,
      direccion: direccion.value,
      comuna: comuna.value,
      fechaEntregaEstimada: fechaEntregaEstimada.value || undefined,
      latitud: latitud.value,
      longitud: longitud.value,
      descripcion: descripcionIa.value,
      estado: estado.value
    };

    const nuevoProyecto = await proyectosService.crear(proyectoData);

    for (const t of tipologias.value) {
      if (t.codigoTipologia && t.superficieM2 > 0 && t.valorEnUf > 0) {
        await tipologiasService.crear(nuevoProyecto.id, t);
      }
    }

    cerrarModal();
    await cargarProyectos();
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Error al guardar el proyecto.';
  } finally {
    guardando.value = false;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL');
};
</script>

<template>
  <AdminLayout titulo="Gestión de Proyectos">
    <div class="max-w-6xl mx-auto flex flex-col gap-6 relative">
      
      <!-- Encabezado y botón -->
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Gestión de Proyectos</h1>
          <p class="text-slate-500 text-sm mt-1">Administra los proyectos inmobiliarios del catálogo comercial.</p>
        </div>
        <button
          @click="abrirModal"
          class="bg-[#003399] hover:bg-blue-800 text-white font-bold text-sm px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2 cursor-pointer"
        >
          <FolderPlus class="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      <div v-if="errorLista" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        ⚠️ {{ errorLista }}
      </div>

      <!-- Listado de Proyectos -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th class="p-4">ID</th>
                <th class="p-4">Título</th>
                <th class="p-4">Comuna</th>
                <th class="p-4">Entrega Est.</th>
                <th class="p-4">Estado</th>
                <th class="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-if="cargandoLista">
                <td colspan="6" class="p-8 text-center text-slate-400 font-medium">Cargando proyectos...</td>
              </tr>
              <tr v-else-if="proyectos.length === 0">
                <td colspan="6" class="p-8 text-center text-slate-400 font-medium">No se encontraron proyectos.</td>
              </tr>
              <tr
                v-else
                v-for="proyecto in proyectos"
                :key="proyecto.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="p-4 text-slate-500 font-mono text-xs">#{{ proyecto.id }}</td>
                <td class="p-4 font-bold text-slate-800">{{ proyecto.titulo }}</td>
                <td class="p-4 text-slate-600">{{ proyecto.comuna }}</td>
                <td class="p-4 text-slate-600">{{ formatDate(proyecto.fechaEntregaEstimada) }}</td>
                <td class="p-4">
                  <span 
                    :class="{
                      'bg-emerald-100 text-emerald-700': proyecto.estado === 'activo',
                      'bg-amber-100 text-amber-700': proyecto.estado === 'borrador',
                      'bg-slate-100 text-slate-700': proyecto.estado === 'archivado' || proyecto.estado === 'inactivo'
                    }"
                    class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                  >
                    {{ proyecto.estado }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="p-1.5 text-slate-400 hover:text-[#003399] hover:bg-blue-50 rounded transition-colors cursor-pointer" title="Editar">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer" title="Eliminar">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Creación -->
      <Teleport to="body">
        <div v-if="modalAbierto" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-slate-50 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col border border-slate-200 max-h-[90vh]">
            <div class="p-6 bg-white border-b border-slate-200 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
              <h3 class="font-black text-slate-900 text-xl">Nuevo Proyecto Comercial</h3>
              <button @click="cerrarModal" class="text-slate-400 hover:text-slate-700 cursor-pointer text-2xl leading-none">&times;</button>
            </div>
            
            <div class="p-6 overflow-y-auto">
              <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold mb-6">
                ⚠️ {{ errorMsg }}
              </div>

              <form @submit.prevent="guardarProyecto" class="flex flex-col gap-6">
                
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <!-- Info General -->
                  <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <span class="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center text-xs">1</span>
                      Información General
                    </div>
                    
                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Título del proyecto *</label>
                      <input v-model="titulo" type="text" placeholder="Ej: Edificio Vista Parque" required class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" />
                    </div>

                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección completa *</label>
                      <input v-model="direccion" type="text" placeholder="Ej: Av. Providencia 1234" required class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Comuna *</label>
                        <input v-model="comuna" type="text" placeholder="Ej: Providencia" required class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" />
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Entrega</label>
                        <input v-model="fechaEntregaEstimada" type="date" class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors text-slate-600" />
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
                      <select v-model="estado" class="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors">
                        <option value="borrador">Borrador</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <!-- Geolocalización Interactiva -->
                  <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <span class="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center text-xs">2</span>
                      Geolocalización
                    </div>
                    
                    <!-- Contenedor del Mapa Leaflet -->
                    <div id="mapContainer" class="flex-1 w-full bg-slate-100 rounded-xl border border-slate-200 min-h-[180px] z-10"></div>
                    <p class="text-[10px] text-slate-500 mt-[-5px]">Arrastra el marcador azul o haz click en el mapa para ajustar.</p>

                    <div class="grid grid-cols-2 gap-3 mt-1">
                      <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Latitud</label>
                        <input v-model.number="latitud" @change="actualizarMapaDesdeInputs" type="number" step="any" required class="w-full border border-slate-200 bg-slate-50 focus:border-[#003399] focus:bg-white focus:outline-none rounded-lg p-2 text-xs text-slate-600 font-mono" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Longitud</label>
                        <input v-model.number="longitud" @change="actualizarMapaDesdeInputs" type="number" step="any" required class="w-full border border-slate-200 bg-slate-50 focus:border-[#003399] focus:bg-white focus:outline-none rounded-lg p-2 text-xs text-slate-600 font-mono" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contenido Inteligente (Gemini AI) -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <span class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">3</span>
                      Contenido Inteligente
                    </div>
                    <button type="button" @click="llamarGemini" :disabled="generandoIa" class="bg-slate-50 border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-600 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer">
                      <Sparkles class="w-4 h-4 text-amber-500" /> {{ generandoIa ? 'Conectando con Gemini AI...' : 'Redactar con IA de Google' }}
                    </button>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Descripción de la propiedad *</label>
                    <textarea v-model="descripcionIa" rows="5" required placeholder="Describe las características o deja que la IA lo redacte por ti..." class="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors resize-none leading-relaxed"></textarea>
                  </div>
                </div>

                <!-- Tipologías -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <span class="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center text-xs">4</span>
                      Tipologías (Modelos)
                    </div>
                    <button type="button" @click="agregarTipologia" class="bg-[#003399]/10 text-[#003399] hover:bg-[#003399]/20 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
                      <Plus class="w-4 h-4" /> Añadir tipología
                    </button>
                  </div>

                  <div v-for="(tipo, index) in tipologias" :key="index" class="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                    <button v-if="tipologias.length > 1" type="button" @click="eliminarTipologia(index)" class="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 class="w-4 h-4" />
                    </button>
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Código *</label>
                        <input v-model="tipo.codigoTipologia" type="text" placeholder="Ej: 2D2B" required class="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:border-[#003399]" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dorms.</label>
                        <input v-model.number="tipo.dormitorios" type="number" min="0" class="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:border-[#003399]" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Baños</label>
                        <input v-model.number="tipo.banos" type="number" min="0" step="0.5" class="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:border-[#003399]" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Superficie (m²)</label>
                        <input v-model.number="tipo.superficieM2" type="number" min="1" step="0.1" class="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:border-[#003399]" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor (UF)</label>
                        <input v-model.number="tipo.valorEnUf" type="number" min="1" class="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:border-[#003399]" />
                      </div>
                    </div>
                  </div>
                  
                  <p v-if="tipologias.length === 0" class="text-sm text-slate-500 text-center py-4">No has añadido ninguna tipología.</p>
                </div>

                <div class="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white p-4 border-t border-slate-200 -mx-6 -mb-6 rounded-b-2xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
                  <button type="button" @click="cerrarModal" class="px-5 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center">
                    Cancelar
                  </button>
                  <button type="submit" :disabled="guardando" class="px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#003399] hover:bg-blue-800 transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50">
                    <Save class="w-4 h-4" /> {{ guardando ? 'Guardando...' : 'Crear y Publicar Proyecto' }}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </AdminLayout>
</template>