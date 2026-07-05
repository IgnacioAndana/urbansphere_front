<script setup lang="ts">
import { Heart } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useFavoritos } from '../../composables/useFavoritos'
import { queryLoginDesde } from '../../utils/authRedirect'

const props = withDefaults(
  defineProps<{
    proyectoId: number | string
    /** card = botón compacto en listado; detail = botón circular en ficha */
    variant?: 'card' | 'detail'
  }>(),
  { variant: 'card' },
)

const emit = defineEmits<{
  cambio: [eraFavorito: boolean]
}>()

const route = useRoute()
const router = useRouter()
const { puedeUsarFavoritos, esFavorito, alternarFavorito } = useFavoritos()

const favorito = () => esFavorito(props.proyectoId)

async function onClick() {
  if (!puedeUsarFavoritos.value) {
    await router.push({
      path: '/login',
      query: {
        ...queryLoginDesde(route.path, route.fullPath),
        aviso: 'favoritos',
      },
    })
    return
  }

  const eraFavorito = favorito()
  const ok = await alternarFavorito(props.proyectoId)
  if (ok) emit('cambio', eraFavorito)
}
</script>

<template>
  <button
    type="button"
    class="transition-colors flex items-center justify-center shrink-0"
    :class="
      variant === 'detail'
        ? [
            'w-10 h-10 rounded-full bg-white border shadow-sm',
            favorito()
              ? 'border-red-200 text-red-500 bg-red-50'
              : 'border-slate-200 text-slate-400 hover:text-red-500',
          ]
        : [
            'px-3 border rounded-lg',
            favorito()
              ? 'border-red-200 bg-red-50 text-red-500'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50',
          ]
    "
    :title="
      puedeUsarFavoritos
        ? favorito()
          ? 'Quitar de favoritos'
          : 'Agregar a favoritos'
        : 'Inicia sesión para guardar favoritos'
    "
    @click="onClick"
  >
    <Heart
      :class="['', variant === 'detail' ? 'w-5 h-5' : 'w-4 h-4', favorito() ? 'fill-current' : '']"
    />
  </button>
</template>
