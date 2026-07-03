<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Heart, LayoutGrid } from 'lucide-vue-next'
import MiPerfilForm from '../../components/MiPerfilForm.vue'
import { useSesion } from '../../composables/useSesion'

const { nombre, email, cargarSesion } = useSesion()

onMounted(() => {
  void cargarSesion()
})

const iniciales = computed(() => {
  const n = nombre.value?.trim() ?? 'U'
  return n
    .split(' ')
    .map((p) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

const onActualizado = async () => {
  await cargarSesion()
}
</script>

<template>
  <div class="grid lg:grid-cols-5 gap-6">
    <div class="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <MiPerfilForm @actualizado="onActualizado" />
    </div>

    <div class="lg:col-span-2 flex flex-col gap-4">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div class="flex items-center gap-4 mb-4">
          <div
            class="w-14 h-14 rounded-full bg-gradient-to-tr from-[#003399] to-blue-400 flex items-center justify-center text-white text-lg font-black"
          >
            {{ iniciales }}
          </div>
          <div class="min-w-0">
            <p class="font-black text-slate-900 truncate">{{ nombre ?? 'Usuario' }}</p>
            <p class="text-sm text-slate-500 truncate">{{ email ?? '—' }}</p>
          </div>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed">
          Tu cuenta te permite guardar favoritos, solicitar información sobre proyectos y gestionar tus datos de contacto.
        </p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Accesos rápidos</p>
        <router-link
          to="/perfil/favoritos"
          class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-[#003399] transition-colors"
        >
          <Heart class="w-4 h-4" /> Ver mis favoritos
        </router-link>
        <router-link
          to="/catalogo"
          class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-[#003399] transition-colors"
        >
          <LayoutGrid class="w-4 h-4" /> Explorar catálogo
        </router-link>
      </div>
    </div>
  </div>
</template>
