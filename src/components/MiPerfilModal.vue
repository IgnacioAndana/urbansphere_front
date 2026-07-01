<script setup lang="ts">
import MiPerfilForm from './MiPerfilForm.vue'

defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  cerrar: []
  actualizado: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="abierto"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
    >
      <div
        role="dialog"
        aria-labelledby="mi-perfil-titulo"
        class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 id="mi-perfil-titulo" class="text-lg font-black text-slate-900">Mi perfil</h2>
          <button type="button" class="text-slate-400 hover:text-slate-600 text-xl leading-none" @click="emit('cerrar')">
            ×
          </button>
        </div>

        <div class="p-6">
          <MiPerfilForm
            :activo="abierto"
            mostrar-cancelar
            @actualizado="emit('actualizado')"
            @cancelar="emit('cerrar')"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
