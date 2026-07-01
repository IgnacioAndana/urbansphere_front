<script setup lang="ts">
import { ArrowRight, MapPin, Building, ShieldCheck } from 'lucide-vue-next';
import PublicLayout from '../layouts/PublicLayout.vue';
</script>

<template>
  <PublicLayout>
    <div class="w-full flex-1 bg-white">
      <!-- Hero Section -->
      <section class="relative bg-slate-900 overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-40"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent"></div>
        
        <div class="relative max-w-7xl mx-auto px-6 py-32 md:py-48 flex flex-col items-start justify-center min-h-[calc(100vh-75px)]">
          <span class="text-blue-400 font-black tracking-widest uppercase text-sm mb-4">Inteligencia Inmobiliaria</span>
          <h1 class="text-5xl md:text-7xl font-black text-white leading-tight max-w-3xl">
            Encuentra tu próximo <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">hogar</span> con certeza.
          </h1>
          <p class="text-slate-300 text-lg md:text-xl max-w-xl mt-6 font-medium">
            UrbanSphere revoluciona la forma en que interactúas con los bienes raíces. Explora el mapa, revisa fichas técnicas detalladas y conecta con agentes verificados.
          </p>
          
          <div class="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <router-link to="/catalogo" class="px-8 py-4 bg-[#003399] hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30">
              Explorar Catálogo <ArrowRight class="w-5 h-5" />
            </router-link>
            <router-link to="/contacto" class="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-xl flex items-center justify-center transition-all border border-white/20">
              Contáctanos
            </router-link>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-24 bg-slate-50">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-black text-slate-900">¿Por qué elegir UrbanSphere?</h2>
            <p class="text-slate-500 mt-4 max-w-2xl mx-auto">La plataforma más avanzada para la búsqueda y gestión de propiedades en el ecosistema urbano.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <MapPin class="w-7 h-7 text-[#003399]" />
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">Geolocalización Precisa</h3>
              <p class="text-slate-500 leading-relaxed">
                Navega a través de nuestro mapa interactivo en tiempo real y encuentra exactamente lo que buscas en la zona ideal.
              </p>
            </div>

            <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Building class="w-7 h-7 text-[#003399]" />
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">Catálogo Extenso</h3>
              <p class="text-slate-500 leading-relaxed">
                Desde estudios modernos hasta casas familiares. Contamos con un portafolio actualizado y validado diariamente.
              </p>
            </div>

            <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck class="w-7 h-7 text-[#003399]" />
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">Conexión Segura</h3>
              <p class="text-slate-500 leading-relaxed">
                Todas las reservas y consultas son manejadas a través de nuestro sistema de mensajería asíncrona de alta seguridad.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </PublicLayout>
</template>
