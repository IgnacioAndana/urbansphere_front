<script setup lang="ts">
import { useRoute } from 'vue-router';
import { MapPin, Bed, Bath, Maximize, Calendar, ShieldCheck, ChevronRight, Share2, Heart } from 'lucide-vue-next';
import PublicLayout from '../layouts/PublicLayout.vue';

const route = useRoute();
const propiedadId = route.params.id; // Captura el ID de la URL (ej: /propiedad/1)
</script>

<template>
  <PublicLayout>
    <!-- Breadcrumb (Migas de pan) -->
    <div class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <router-link to="/catalogo" class="hover:text-[#003399] transition-colors">Catálogo</router-link>
        <ChevronRight class="w-4 h-4" />
        <span class="text-slate-400">Propiedad ID {{ propiedadId }}</span>
      </div>
    </div>

    <div class="bg-slate-50 min-h-[calc(100vh-130px)]">
      <div class="max-w-7xl mx-auto p-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
        
        <!-- Bloque Izquierdo: Ficha del Proyecto (8 Columnas) -->
        <div class="lg:col-span-8 flex flex-col gap-8">
          
          <!-- Encabezado de la propiedad -->
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <span class="text-xs bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded uppercase tracking-wide">En Venta</span>
                <span class="text-xs bg-blue-100 text-[#003399] font-black px-3 py-1 rounded uppercase tracking-wide">Proyecto Residencial</span>
              </div>
              <h1 class="text-4xl font-black text-slate-900 leading-tight">Vista Parque Residencias</h1>
              <p class="text-slate-500 font-medium mt-2 flex items-center gap-2">
                <MapPin class="w-5 h-5 text-slate-400" /> Av. El Parque 1234, Providencia, Santiago
              </p>
            </div>
            <div class="text-left md:text-right">
              <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Precio Desde</p>
              <p class="text-4xl font-black text-[#003399]">UF 8.950</p>
              <div class="flex items-center gap-2 justify-start md:justify-end mt-4">
                <button class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm">
                  <Heart class="w-5 h-5" />
                </button>
                <button class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#003399] hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm">
                  <Share2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Características Rápidas -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
              <Bed class="w-6 h-6 text-[#003399] mb-2" />
              <span class="font-black text-lg text-slate-900">2 - 3</span>
              <span class="text-xs text-slate-500 uppercase font-bold tracking-wide">Dormitorios</span>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
              <Bath class="w-6 h-6 text-[#003399] mb-2" />
              <span class="font-black text-lg text-slate-900">2</span>
              <span class="text-xs text-slate-500 uppercase font-bold tracking-wide">Baños</span>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
              <Maximize class="w-6 h-6 text-[#003399] mb-2" />
              <span class="font-black text-lg text-slate-900">65 - 95</span>
              <span class="text-xs text-slate-500 uppercase font-bold tracking-wide">m² Totales</span>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
              <Calendar class="w-6 h-6 text-[#003399] mb-2" />
              <span class="font-black text-lg text-slate-900">2026</span>
              <span class="text-xs text-slate-500 uppercase font-bold tracking-wide">Entrega</span>
            </div>
          </div>

          <!-- Placeholder del Visor 360° -->
          <div class="bg-slate-900 text-white h-[450px] rounded-3xl flex flex-col items-center justify-center p-6 text-center border border-slate-800 shadow-2xl relative overflow-hidden group cursor-pointer">
            <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            
            <div class="relative z-10 flex flex-col items-center">
              <div class="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/30 group-hover:bg-[#003399]/80 transition-colors">
                <span class="text-4xl">🔄</span>
              </div>
              <h2 class="text-2xl font-black mb-2">Visor Inmersivo 360°</h2>
              <p class="text-slate-300 max-w-sm">Haz clic para iniciar el recorrido virtual interactivo por el departamento piloto.</p>
            </div>
          </div>

          <!-- Descripción -->
          <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-4">
            <h3 class="text-2xl font-black text-slate-900 mb-4">Acerca de este proyecto</h3>
            <p class="text-slate-600 leading-relaxed mb-4">
              Condominio Vista Parque redefine el concepto de vida urbana. Ubicado en el corazón de Providencia, frente al parque, ofrece una conectividad inigualable y vistas despejadas que garantizan luz natural durante todo el día.
            </p>
            <p class="text-slate-600 leading-relaxed">
              Equipado con terminaciones de alto estándar, sistema domótico integrado, ventanas termopanel y amplias terrazas. Las áreas comunes incluyen piscina panorámica, gimnasio equipado, salón gourmet y bicicleteros.
            </p>
          </div>
        </div>

        <!-- Bloque Derecho: Formulario de Captura de Leads (4 Columnas) -->
        <div class="lg:col-span-4">
          <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl sticky top-28">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <ShieldCheck class="w-6 h-6 text-[#003399]" />
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900 leading-tight">Contacto Directo</h3>
                <p class="text-xs text-slate-500">Agente verificado UrbanSphere</p>
              </div>
            </div>
            
            <form class="flex flex-col gap-4" @submit.prevent>
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre completo *</label>
                <input type="text" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] bg-slate-50 focus:bg-white transition-colors" placeholder="Ej: Juan Pérez" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Correo electrónico *</label>
                <input type="email" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] bg-slate-50 focus:bg-white transition-colors" placeholder="ejemplo@correo.com" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Teléfono</label>
                <input type="tel" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] bg-slate-50 focus:bg-white transition-colors" placeholder="+56 9 1234 5678" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mensaje</label>
                <textarea class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] bg-slate-50 focus:bg-white transition-colors resize-none" rows="3" placeholder="Hola, me gustaría recibir más información sobre este proyecto..."></textarea>
              </div>
              <button class="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold hover:bg-[#003399] transition-all shadow-md mt-2 flex items-center justify-center gap-2">
                Solicitar Información
              </button>
              <p class="text-center text-[10px] text-slate-400 mt-2">
                Al enviar aceptas nuestros términos de servicio y políticas de privacidad.
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  </PublicLayout>
</template>