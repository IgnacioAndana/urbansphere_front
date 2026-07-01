<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import { usuariosService, rolesService } from '../services/usuarios'
import { useSesion } from '../composables/useSesion'
import { ROLES } from '../constants/roles'
import { obtenerMensajeError } from '../utils/apiError'
import type { Rol, Usuario } from '../types/usuarios'

const { puedeCrearEliminarUsuarios } = useSesion()

const usuarios = ref<Usuario[]>([])
const roles = ref<Rol[]>([])
const cargando = ref(true)
const errorMsg = ref('')

const modalAgregar = ref(false)
const guardando = ref(false)
const formError = ref('')

const nuevoNombre = ref('')
const nuevoEmail = ref('')
const nuevoContrasena = ref('')
const nuevoRolId = ref(ROLES.USER)

const rolLabel = (u: Usuario) => u.rol?.nombre ?? `rol #${u.rolId ?? '?'}`

onMounted(async () => {
  await cargarLista()
  if (puedeCrearEliminarUsuarios.value) {
    try {
      roles.value = await rolesService.listar()
    } catch {
      roles.value = [
        { id: ROLES.ADMIN, nombre: 'admin' },
        { id: ROLES.USER, nombre: 'user' },
        { id: ROLES.AGENT, nombre: 'agent' },
      ]
    }
  }
})

const cargarLista = async () => {
  cargando.value = true
  errorMsg.value = ''
  try {
    usuarios.value = await usuariosService.listar()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo cargar la lista de usuarios.')
  } finally {
    cargando.value = false
  }
}

const abrirAgregar = () => {
  formError.value = ''
  nuevoNombre.value = ''
  nuevoEmail.value = ''
  nuevoContrasena.value = ''
  nuevoRolId.value = ROLES.USER
  modalAgregar.value = true
}

const crearUsuario = async () => {
  formError.value = ''
  guardando.value = true
  try {
    await usuariosService.crear({
      nombre: nuevoNombre.value.trim(),
      email: nuevoEmail.value.trim(),
      contrasena: nuevoContrasena.value,
      rolId: nuevoRolId.value,
    })
    modalAgregar.value = false
    await cargarLista()
  } catch (error) {
    formError.value = obtenerMensajeError(error, 'No se pudo crear el usuario.')
  } finally {
    guardando.value = false
  }
}

const eliminarUsuario = async (u: Usuario) => {
  if (!confirm(`¿Eliminar a ${u.nombre} (${u.email})?`)) return
  try {
    await usuariosService.eliminar(u.id)
    await cargarLista()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo eliminar el usuario.')
  }
}

const rolesParaSelect = computed(() =>
  roles.value.filter((r) => (Object.values(ROLES) as number[]).includes(r.id)),
)
</script>

<template>
  <AdminLayout titulo="Usuarios">
    <div class="max-w-5xl mx-auto flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-900">Usuarios</h1>
          <p class="text-slate-500 text-sm mt-1">
            {{ puedeCrearEliminarUsuarios ? 'Admin: agregar y eliminar usuarios.' : 'Agente: solo consulta.' }}
          </p>
        </div>
        <button
          v-if="puedeCrearEliminarUsuarios"
          type="button"
          class="bg-[#003399] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-800"
          @click="abrirAgregar"
        >
          + Agregar usuario
        </button>
      </div>

      <div v-if="errorMsg" role="alert" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
        {{ errorMsg }}
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div v-if="cargando" class="p-8 text-center text-slate-500 text-sm">Cargando usuarios...</div>
        <table v-else class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3 font-bold">Nombre</th>
              <th class="px-4 py-3 font-bold">Email</th>
              <th class="px-4 py-3 font-bold">Rol</th>
              <th class="px-4 py-3 font-bold">Estado</th>
              <th v-if="puedeCrearEliminarUsuarios" class="px-4 py-3 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id" class="border-b border-slate-100 hover:bg-slate-50/50">
              <td class="px-4 py-3 font-medium text-slate-800">{{ u.nombre }}</td>
              <td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
              <td class="px-4 py-3 capitalize">{{ rolLabel(u) }}</td>
              <td class="px-4 py-3">
                <span :class="u.activo !== false ? 'text-emerald-600' : 'text-red-500'" class="font-semibold text-xs">
                  {{ u.activo !== false ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td v-if="puedeCrearEliminarUsuarios" class="px-4 py-3 text-right">
                <button type="button" class="text-red-600 hover:text-red-800 font-bold text-xs" @click="eliminarUsuario(u)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!cargando && usuarios.length === 0" class="p-8 text-center text-slate-500">No hay usuarios registrados.</p>
      </div>
    </div>

    <!-- Modal agregar usuario (solo admin) -->
    <Teleport to="body">
      <div v-if="modalAgregar" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40" @click.self="modalAgregar = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 p-6 flex flex-col gap-4">
          <h2 class="text-lg font-black text-slate-900">Nuevo usuario</h2>
          <div v-if="formError" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{{ formError }}</div>
          <form class="flex flex-col gap-3" @submit.prevent="crearUsuario">
            <input v-model="nuevoNombre" type="text" placeholder="Nombre" required class="border border-slate-200 rounded-xl p-3 text-sm" />
            <input v-model="nuevoEmail" type="email" placeholder="Email" required class="border border-slate-200 rounded-xl p-3 text-sm" />
            <input v-model="nuevoContrasena" type="password" placeholder="Contraseña" required class="border border-slate-200 rounded-xl p-3 text-sm" />
            <select v-model="nuevoRolId" class="border border-slate-200 rounded-xl p-3 text-sm bg-white">
              <option v-for="r in rolesParaSelect" :key="r.id" :value="r.id">{{ r.nombre }}</option>
            </select>
            <div class="flex gap-2 pt-2">
              <button type="button" class="flex-1 border border-slate-200 py-2 rounded-xl text-sm font-bold" @click="modalAgregar = false">Cancelar</button>
              <button type="submit" :disabled="guardando" class="flex-1 bg-[#003399] text-white py-2 rounded-xl text-sm font-bold disabled:opacity-50">
                {{ guardando ? 'Creando...' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>
