<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import PublicLayout from '../layouts/PublicLayout.vue'
import MiPerfilForm from '../components/MiPerfilForm.vue'
import { useSesion } from '../composables/useSesion'

const { cargarSesion } = useSesion()

const onActualizado = async () => {
  await cargarSesion()
}
</script>

<template>
  <PublicLayout>
    <div class="max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-6">
      <router-link
        to="/"
        class="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#003399] transition-colors w-fit"
      >
        <ArrowLeft class="w-4 h-4" /> Volver
      </router-link>

      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900">Mi perfil</h1>
        <p class="text-slate-500 text-sm mt-1">
          Administra los datos de tu cuenta. Aquí podrás agregar más información en el futuro.
        </p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <MiPerfilForm @actualizado="onActualizado" />
      </div>
    </div>
  </PublicLayout>
</template>
