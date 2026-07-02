<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { MapPin, Sparkles, Image as Save, Plus, Trash2 } from 'lucide-vue-next';
import AdminLayout from '../layouts/AdminLayout.vue';
import { proyectosService, tipologiasService } from '../services/proyectos';
import type { CrearProyectoDto, CrearTipologiaDto } from '../types/proyectos';

const router = useRouter();

// Proyecto
const titulo = ref('');
const direccion = ref('');
const comuna = ref('');
const fechaEntregaEstimada = ref('');
const estado = ref('activo');
const latitud = ref(-33.4489);
const longitud = ref(-70.6693);
const descripcionIa = ref('');

// Estado de UI
const generandoIa = ref(false);
const guardando = ref(false);
const errorMsg = ref('');

// Tipologías
const tipologias = ref<CrearTipologiaDto[]>([
  {
    codigoTipologia: '',
    dormitorios: 1,
    banos: 1,
    superficieM2: 30,
    valorEnUf: 2000
  }
]);

const agregarTipologia = () => {
  tipologias.value.push({
    codigoTipologia: '',
    dormitorios: 1,
    banos: 1,
    superficieM2: 30,
    valorEnUf: 2000
  });
};

const eliminarTipologia = (index: number) => {
  tipologias.value.splice(index, 1);
};

const llamarGemini = () => {
  if (!titulo.value) {
    alert("Por favor, ingresa al menos el título del proyecto para que la IA tenga contexto.");
    return;
  }
  generandoIa.value = true;
  setTimeout(() => {
    descripcionIa.value = `Descubre ${titulo.value}, un exclusivo proyecto residencial diseñado bajo los más altos estándares de arquitectura moderna. Ubicado en un sector privilegiado con conectividad inmejorable, ofrece amplios espacios comunes, excelente iluminación natural y terminaciones de primer nivel ideales para tu familia.`;
    generandoIa.value = false;
  }, 1500);
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

    // Crear Proyecto
    const nuevoProyecto = await proyectosService.crear(proyectoData);

    // Crear Tipologías
    for (const t of tipologias.value) {
      if (t.codigoTipologia && t.superficieM2 > 0 && t.valorEnUf > 0) {
        await tipologiasService.crear(nuevoProyecto.id, t);
      }
    }

    // Redirigir al catálogo
    router.push('/catalogo');
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Error al guardar el proyecto.';
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <AdminLayout titulo="Proyectos">
    <div class="max-w-5xl mx-auto flex flex-col gap-6">
      
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Nuevo Proyecto</h1>
        <p class="text-slate-500 text-sm mt-1">Completa la información del proyecto para publicarlo en el catálogo comercial.</p>
      </div>

      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        ⚠️ {{ errorMsg }}
      </div>

      <form @submit.prevent="guardarProyecto" class="flex flex-col gap-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
            <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span class="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center text-xs">1</span>
              Información General
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Título del proyecto *</label>
              <input v-model="titulo" type="text" placeholder="Ej: Edificio Vista Parque" required class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección completa *</label>
              <input v-model="direccion" type="text" placeholder="Ej: Av. Providencia 1234" required class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Comuna *</label>
                <input v-model="comuna" type="text" placeholder="Ej: Providencia" required class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Entrega</label>
                <input v-model="fechaEntregaEstimada" type="date" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors text-slate-600" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
              <select v-model="estado" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors">
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>
          </div>

          <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
            <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span class="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center text-xs">2</span>
              Geolocalización
            </div>
            
            <div class="flex-1 bg-slate-100 rounded-xl border border-slate-200 min-h-[140px] flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
              <MapPin class="w-8 h-8 text-red-500 z-10" />
              <p class="text-[11px] text-slate-500 font-semibold mt-1 z-10">Mapa Base de Carga</p>
              <span class="text-[9px] text-slate-400 z-10">Arrastra el marcador para precisar</span>
              <div class="absolute inset-0 opacity-25 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px]"></div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Latitud</label>
                <input v-model.number="latitud" type="number" step="any" required class="w-full border border-slate-200 bg-white focus:border-[#003399] focus:outline-none rounded-lg p-2 text-xs text-slate-600 font-mono" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Longitud</label>
                <input v-model.number="longitud" type="number" step="any" required class="w-full border border-slate-200 bg-white focus:border-[#003399] focus:outline-none rounded-lg p-2 text-xs text-slate-600 font-mono" />
              </div>
            </div>
          </div>

        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span class="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center text-xs">3</span>
              Contenido Inteligente
            </div>
            <button type="button" @click="llamarGemini" :disabled="generandoIa" class="bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-[#003399] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer">
              <Sparkles class="w-4 h-4 text-amber-400" /> {{ generandoIa ? 'Redactando...' : 'Generar descripción comercial' }}
            </button>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Descripción de la propiedad *</label>
            <textarea v-model="descripcionIa" rows="4" required placeholder="Describe las características, beneficios y entorno del proyecto..." class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-4 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors resize-none leading-relaxed"></textarea>
          </div>
        </div>

        <!-- Tipologías -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
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
            <button v-if="tipologias.length > 1" type="button" @click="eliminarTipologia(index)" class="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
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
          
          <p v-if="tipologias.length === 0" class="text-sm text-slate-500 text-center py-4">No has añadido ninguna tipología. Presiona "Añadir tipología" para incluir al menos una.</p>
        </div>

        <!-- Imágenes omitidas según el plan actual -->

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200/60">
          <router-link to="/catalogo" class="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center flex items-center">
            Cancelar
          </router-link>
          <button type="submit" :disabled="guardando" class="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#003399] hover:bg-blue-800 transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50">
            <Save class="w-4 h-4" /> {{ guardando ? 'Guardando...' : 'Guardar Proyecto' }}
          </button>
        </div>

      </form>
    </div>
  </AdminLayout>
</template>