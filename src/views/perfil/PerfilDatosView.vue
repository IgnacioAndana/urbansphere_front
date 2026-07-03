<script setup lang="ts">
import MiPerfilForm from '../../components/MiPerfilForm.vue'
import { useSesion } from '../../composables/useSesion'

const { cargarSesion } = useSesion()

const onActualizado = async () => {
  await cargarSesion()
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
    <MiPerfilForm @actualizado="onActualizado" />
  </div>
</template>
