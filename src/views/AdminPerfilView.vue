<script setup lang="ts">
import AdminLayout from '../layouts/AdminLayout.vue'
import MiPerfilForm from '../components/MiPerfilForm.vue'
import { useSesion } from '../composables/useSesion'

const { cargarSesion } = useSesion()

const onActualizado = async () => {
  await cargarSesion()
}
</script>

<template>
  <AdminLayout titulo="Mi perfil">
    <div class="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900">Mi perfil</h1>
        <p class="text-slate-500 text-sm mt-1">Administra los datos de tu cuenta.</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <MiPerfilForm @actualizado="onActualizado" />
      </div>
    </div>
  </AdminLayout>
</template>
