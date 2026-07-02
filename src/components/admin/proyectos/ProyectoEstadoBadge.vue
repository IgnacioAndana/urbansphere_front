<script setup lang="ts">
defineProps<{
  estado: string
}>()
</script>

<template>
  <span
    :class="{
      'bg-emerald-100 text-emerald-700': estado === 'activo',
      'bg-amber-100 text-amber-700': estado === 'borrador',
      'bg-slate-100 text-slate-700': estado === 'archivado' || estado === 'inactivo',
    }"
    class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
  >
    {{ estado }}
  </span>
</template>
