<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { useAvisoFlotante } from '../composables/useAvisoFlotante'

const { mensaje, cerrar } = useAvisoFlotante()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mensaje"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40"
        role="presentation"
        @click.self="cerrar"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="mensaje"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="aviso-flotante-titulo"
            class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-amber-200 overflow-hidden"
          >
            <div class="p-6 flex flex-col gap-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle class="w-5 h-5" />
                </div>
                <div class="min-w-0 pt-0.5">
                  <h2 id="aviso-flotante-titulo" class="font-black text-slate-900 text-base">
                    Aviso
                  </h2>
                  <p class="text-sm text-slate-600 mt-1 leading-relaxed">{{ mensaje }}</p>
                </div>
              </div>
              <button
                type="button"
                class="w-full py-2.5 rounded-xl bg-[#003399] text-white text-sm font-bold hover:bg-blue-800 transition-colors"
                @click="cerrar"
              >
                Entendido
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
