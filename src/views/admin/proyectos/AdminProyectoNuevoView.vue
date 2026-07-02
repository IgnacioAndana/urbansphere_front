<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import AdminProyectoFormContent from './AdminProyectoFormContent.vue'
</script>

<template>
  <AdminLayout titulo="Nuevo proyecto">
    <div class="max-w-6xl mx-auto flex flex-col gap-6">
      <router-link to="/admin/proyectos" class="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#003399] w-fit">
        <ArrowLeft class="w-4 h-4" /> Volver al listado
      </router-link>
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900">Nuevo proyecto</h1>
        <p class="text-slate-500 text-sm mt-1">Paso 1: datos generales. Luego podrás agregar tipologías, imágenes y equipamiento.</p>
      </div>
      <AdminProyectoFormContent />
    </div>
  </AdminLayout>
</template>
