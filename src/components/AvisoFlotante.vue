<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useAvisoFlotante } from '../composables/useAvisoFlotante'

const { mensaje, cerrar } = useAvisoFlotante()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="mensaje"
        role="status"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] w-[min(100%-2rem,28rem)] flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm shadow-lg border border-slate-700"
      >
        <p class="flex-1 leading-snug">{{ mensaje }}</p>
        <button
          type="button"
          class="shrink-0 p-0.5 rounded text-slate-400 hover:text-white transition-colors"
          aria-label="Cerrar aviso"
          @click="cerrar"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
