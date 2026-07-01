<script setup lang="ts">
import { ref } from 'vue';
import { MapPin, Sparkles, CloudUpload, Image as ImageIcon, Save } from 'lucide-vue-next';
import AdminLayout from '../layouts/AdminLayout.vue';

const titulo = ref('');
const direccion = ref('');
const precio = ref('');
const descripcionIa = ref('');
const generandoIa = ref(false);

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
</script>

<template>
  <AdminLayout titulo="Proyectos">
    <div class="max-w-5xl mx-auto flex flex-col gap-6">
      
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Nuevo Proyecto</h1>
        <p class="text-slate-500 text-sm mt-1">Completa la información del proyecto para publicarlo en el catálogo comercial.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
          <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
            <span class="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center text-xs">1</span>
            Información General
          </div>
          
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Título del proyecto *</label>
            <input v-model="titulo" type="text" placeholder="Ej: Edificio Vista Parque" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección completa *</label>
            <input v-model="direccion" type="text" placeholder="Ej: Av. Providencia 1234, Providencia, Santiago" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Precio (CLP) *</label>
            <div class="flex shadow-sm rounded-xl overflow-hidden">
              <span class="bg-slate-100 border border-r-0 border-slate-200 px-4 flex items-center text-xs font-bold text-slate-500">CLP</span>
              <input v-model="precio" type="number" placeholder="Ej: 250000000" class="w-full border border-slate-200 bg-slate-50/50 p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" />
            </div>
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
              <input type="text" value="-33.4489" disabled class="w-full border border-slate-200 bg-slate-100 rounded-lg p-2 text-xs text-slate-500 font-mono" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Longitud</label>
              <input type="text" value="-70.6693" disabled class="w-full border border-slate-200 bg-slate-100 rounded-lg p-2 text-xs text-slate-500 font-mono" />
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
          <button @click="llamarGemini" :disabled="generandoIa" class="bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-[#003399] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer">
            <Sparkles class="w-4 h-4 text-amber-400" /> {{ generandoIa ? 'Redactando...' : 'Generar descripción comercial con Gemini IA' }}
          </button>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Descripción de la propiedad *</label>
          <textarea v-model="descripcionIa" rows="4" placeholder="Describe las características, beneficios y entorno del proyecto..." class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-4 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors resize-none leading-relaxed"></textarea>
          <div class="text-right text-[10px] font-bold text-slate-400 mt-1">0 / 4000 caracteres</div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
        <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
          <span class="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center text-xs">4</span>
          Archivos Multimedia
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
            <CloudUpload class="w-10 h-10 text-slate-300" />
            <p class="text-xs font-bold text-slate-700 mt-2">Arrastra y suelta imágenes aquí</p>
            <p class="text-[10px] text-slate-400 mt-1">Formatos: JPG, PNG, WebP • Máx 10MB</p>
          </div>
          <div class="border border-slate-200 rounded-xl p-6 flex flex-col justify-between bg-slate-50/30">
            <div>
              <div class="flex justify-between items-center">
                <h4 class="text-xs font-bold text-slate-700">Imagen Panorámica 360°</h4>
                <div class="w-8 h-4 bg-slate-200 rounded-full p-0.5 cursor-pointer flex justify-start"><div class="w-3 h-3 bg-white rounded-full shadow-sm"></div></div>
              </div>
              <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">Activa esta opción si deseas subir un recorrido virtual inmersivo esférico para el proyecto.</p>
            </div>
            <div class="border border-slate-200 bg-white rounded-xl p-3 flex items-center gap-3 text-left mt-4">
              <ImageIcon class="w-6 h-6 text-slate-400" />
              <div>
                <p class="text-[11px] font-bold text-slate-700">Seleccionar imagen panorámica 360°</p>
                <p class="text-[9px] text-slate-400">Formatos: JPG • Max 20MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2 border-t border-slate-200/60">
        <button class="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">Cancelar</button>
        <button class="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#003399] hover:bg-blue-800 transition-all shadow-md cursor-pointer flex items-center gap-2">
          <Save class="w-4 h-4" /> Guardar Proyecto
        </button>
      </div>

    </div>
  </AdminLayout>
</template>