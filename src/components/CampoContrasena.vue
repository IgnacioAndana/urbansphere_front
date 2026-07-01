<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  placeholder?: string
  required?: boolean
  autocomplete?: string
  id?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const visible = ref(false)

const alternarVisibilidad = () => {
  visible.value = !visible.value
}
</script>

<template>
  <div class="relative">
    <!-- type="text" + text-security evita el ojo nativo del navegador en type="password" -->
    <input
      :id="id"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      class="campo-contrasena-input w-full border border-slate-200 rounded-xl p-3 pr-11 text-sm focus:outline-none focus:border-[#003399]"
      :class="{ 'campo-contrasena-input--oculta': !visible }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      type="button"
      tabindex="-1"
      class="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-slate-400 hover:text-slate-600"
      :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      @mousedown.prevent
      @click="alternarVisibilidad"
    >
      <svg
        v-if="visible"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.campo-contrasena-input--oculta {
  -webkit-text-security: disc;
  text-security: disc;
}

/* Respaldo por si el navegador añade controles nativos */
.campo-contrasena-input::-ms-reveal,
.campo-contrasena-input::-ms-clear {
  display: none;
}

.campo-contrasena-input::-webkit-credentials-auto-fill-button,
.campo-contrasena-input::-webkit-strong-password-auto-fill-button {
  display: none !important;
  visibility: hidden;
  pointer-events: none;
}
</style>
