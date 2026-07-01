<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import CampoContrasena from '../components/CampoContrasena.vue'
import { usuariosService, authService } from '../services/usuarios'
import { useSesion } from '../composables/useSesion'
import {
  ROLES,
  nombreRolPorId,
  idsUsuarioCoinciden,
  NOMBRE_ROL_ES,
} from '../constants/roles'
import { obtenerMensajeError } from '../utils/apiError'
import type { Usuario } from '../types/usuarios'

const { puedeCrearEliminarUsuarios, cargarSesion } = useSesion()

const usuarios = ref<Usuario[]>([])
const cargando = ref(true)
const errorMsg = ref('')

/** Id y email del perfil real (GET /autenticacion/perfil), no del JWT */
const miUsuarioId = ref<number | null>(null)
const miEmail = ref<string | null>(null)

const modalAgregar = ref(false)
const guardando = ref(false)
const formError = ref('')

const nuevoNombre = ref('')
const nuevoEmail = ref('')
const nuevoContrasena = ref('')
const nuevoContrasenaConfirm = ref('')
const nuevoRolId = ref(ROLES.USER)

const esMiCuenta = (u: Usuario) => {
  if (miUsuarioId.value !== null && idsUsuarioCoinciden(u.id, miUsuarioId.value)) return true
  if (miEmail.value && u.email.toLowerCase() === miEmail.value.toLowerCase()) return true
  return false
}

async function resolverCuentaPropia() {
  try {
    const perfil = await authService.obtenerPerfil()
    miUsuarioId.value = perfil.id
    miEmail.value = perfil.email
  } catch {
    miUsuarioId.value = authService.obtenerUsuarioLocal()?.id ?? null
    miEmail.value = authService.obtenerEmailLocal()
  }
}

onMounted(async () => {
  await cargarSesion()
  await resolverCuentaPropia()
  await cargarLista()
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
  nuevoContrasenaConfirm.value = ''
  nuevoRolId.value = ROLES.USER
  modalAgregar.value = true
}

const crearUsuario = async () => {
  formError.value = ''
  if (nuevoContrasena.value !== nuevoContrasenaConfirm.value) {
    formError.value = 'Las contraseñas no coinciden.'
    return
  }
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
  if (esMiCuenta(u)) {
    errorMsg.value = 'No puedes eliminar tu propia cuenta mientras tienes la sesión iniciada.'
    return
  }
  if (!confirm(`¿Eliminar a ${u.nombre} (${u.email})?`)) return
  try {
    await usuariosService.eliminar(u.id)
    await cargarLista()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo eliminar el usuario.')
  }
}

/** Roles fijos del sistema — no depende de GET /roles */
const rolesParaSelect = computed(() =>
  (Object.values(ROLES) as number[]).map((id) => ({
    id,
    label: NOMBRE_ROL_ES[id],
  })),
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
            <tr
              v-for="u in usuarios"
              :key="u.id"
              class="border-b border-slate-100 hover:bg-slate-50/50"
              :class="esMiCuenta(u) ? 'bg-[#003399]/5' : ''"
            >
              <td class="px-4 py-3 font-medium text-slate-800">
                {{ u.nombre }}
                <span v-if="esMiCuenta(u)" class="ml-1 text-[10px] font-bold uppercase text-[#003399]">(Tú)</span>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
              <td class="px-4 py-3">{{ nombreRolPorId(u.rolId) }}</td>
              <td class="px-4 py-3">
                <span :class="u.activo !== false ? 'text-emerald-600' : 'text-red-500'" class="font-semibold text-xs">
                  {{ u.activo !== false ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td v-if="puedeCrearEliminarUsuarios" class="px-4 py-3 text-right">
                <span v-if="esMiCuenta(u)" class="text-xs text-slate-400 font-medium">
                  Tu cuenta
                </span>
                <button
                  v-else
                  type="button"
                  class="text-red-600 hover:text-red-800 font-bold text-xs"
                  @click="eliminarUsuario(u)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!cargando && usuarios.length === 0" class="p-8 text-center text-slate-500">No hay usuarios registrados.</p>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modalAgregar" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 p-6 flex flex-col gap-4">
          <h2 class="text-lg font-black text-slate-900">Nuevo usuario</h2>
          <div v-if="formError" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{{ formError }}</div>
          <form class="flex flex-col gap-3" @submit.prevent="crearUsuario">
            <input v-model="nuevoNombre" type="text" placeholder="Nombre" required class="border border-slate-200 rounded-xl p-3 text-sm" />
            <input v-model="nuevoEmail" type="email" placeholder="Email" required class="border border-slate-200 rounded-xl p-3 text-sm" />
            <CampoContrasena
              v-model="nuevoContrasena"
              placeholder="Contraseña"
              required
              autocomplete="new-password"
            />
            <CampoContrasena
              v-model="nuevoContrasenaConfirm"
              placeholder="Confirmar contraseña"
              required
              autocomplete="new-password"
            />
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-bold text-slate-500">Rol</span>
              <select
                v-model.number="nuevoRolId"
                required
                class="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm bg-white text-slate-900 cursor-pointer"
              >
                <option v-for="r in rolesParaSelect" :key="r.id" :value="r.id">
                  {{ r.label }}
                </option>
              </select>
            </label>
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
