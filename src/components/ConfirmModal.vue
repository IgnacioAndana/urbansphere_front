<script setup lang="ts">
withDefaults(
  defineProps<{
    abierto: boolean
    titulo: string
    mensaje: string
    confirmarTexto?: string
    cancelarTexto?: string
    cargando?: boolean
    peligro?: boolean
  }>(),
  {
    confirmarTexto: 'Confirmar',
    cancelarTexto: 'Cancelar',
    cargando: false,
    peligro: false,
  },
)

defineEmits<{
  confirmar: []
  cancelar: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="abierto"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titulo ? 'confirm-modal-titulo' : undefined"
        class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden"
      >
        <div class="p-6 flex flex-col gap-4">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="peligro ? 'bg-red-100 text-red-600' : 'bg-[#003399]/10 text-[#003399]'"
            >
              <svg
                v-if="peligro"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h2 id="confirm-modal-titulo" class="text-lg font-black text-slate-900">
                {{ titulo }}
              </h2>
              <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                {{ mensaje }}
              </p>
            </div>
          </div>

          <div class="flex flex-col-reverse sm:flex-row gap-2 pt-1">
            <button
              type="button"
              class="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              :disabled="cargando"
              @click="$emit('cancelar')"
            >
              {{ cancelarTexto }}
            </button>
            <button
              type="button"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              :class="peligro ? 'bg-red-600 hover:bg-red-700' : 'bg-[#003399] hover:bg-blue-800'"
              :disabled="cargando"
              @click="$emit('confirmar')"
            >
              {{ cargando ? 'Procesando...' : confirmarTexto }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
