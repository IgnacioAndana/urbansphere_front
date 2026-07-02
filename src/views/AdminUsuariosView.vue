<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UserPlus, Pencil, Trash2 } from 'lucide-vue-next'
import AdminLayout from '../layouts/AdminLayout.vue'
import CampoContrasena from '../components/CampoContrasena.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { usuariosService, authService } from '../services/usuarios'
import { useSesion } from '../composables/useSesion'
import {
  ROLES,
  idsUsuarioCoinciden,
  NOMBRE_ROL_ES,
} from '../constants/roles'
import { obtenerMensajeError } from '../utils/apiError'
import type { Usuario } from '../types/usuarios'

const { puedeCrearEliminarUsuarios, cargarSesion } = useSesion()

const usuarios = ref<Usuario[]>([])
const cargando = ref(true)
const errorMsg = ref('')

const miUsuarioId = ref<number | null>(null)
const miEmail = ref<string | null>(null)

const modalAgregar = ref(false)
const modoEdicion = ref(false)
const usuarioEdicionId = ref<number | null>(null)
const guardando = ref(false)
const formError = ref('')

const usuarioAEliminar = ref<Usuario | null>(null)
const eliminando = ref(false)

const nuevoNombre = ref('')
const nuevoEmail = ref('')
const nuevoContrasena = ref('')
const nuevoRolId = ref<number | undefined>(ROLES.USER)

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
  modoEdicion.value = false
  usuarioEdicionId.value = null
  nuevoNombre.value = ''
  nuevoEmail.value = ''
  nuevoContrasena.value = ''
  nuevoRolId.value = ROLES.USER
  modalAgregar.value = true
}

const editarUsuario = (usuario: Usuario) => {
  formError.value = ''
  modoEdicion.value = true
  usuarioEdicionId.value = usuario.id
  nuevoNombre.value = usuario.nombre
  nuevoEmail.value = usuario.email
  nuevoContrasena.value = '' // Vacio si no quiere cambiar
  nuevoRolId.value = usuario.rolId
  modalAgregar.value = true
}

const guardarUsuario = async () => {
  formError.value = ''
  guardando.value = true
  try {
    if (modoEdicion.value && usuarioEdicionId.value) {
      // Editar
      const data: any = {
        nombre: nuevoNombre.value.trim(),
        email: nuevoEmail.value.trim(),
        rolId: nuevoRolId.value
      }
      if (nuevoContrasena.value.trim()) {
        data.contrasena = nuevoContrasena.value
      }
      await usuariosService.actualizar(usuarioEdicionId.value, data)
      modalAgregar.value = false
      await cargarLista()
    } else {
      await usuariosService.crear({
        nombre: nuevoNombre.value.trim(),
        email: nuevoEmail.value.trim(),
        contrasena: nuevoContrasena.value,
        rolId: nuevoRolId.value ?? ROLES.USER,
      })
      modalAgregar.value = false
      await cargarLista()
    }
  } catch (error) {
    formError.value = obtenerMensajeError(error, 'No se pudo guardar el usuario.')
  } finally {
    guardando.value = false
  }
}

const solicitarEliminar = (u: Usuario) => {
  if (esMiCuenta(u)) {
    errorMsg.value = 'No puedes eliminar tu propia cuenta mientras tienes la sesión iniciada.'
    return
  }
  usuarioAEliminar.value = u
}

const cancelarEliminar = () => {
  if (!eliminando.value) usuarioAEliminar.value = null
}

const confirmarEliminar = async () => {
  const u = usuarioAEliminar.value
  if (!u) return

  eliminando.value = true
  errorMsg.value = ''
  try {
    await usuariosService.eliminar(u.id)
    usuarioAEliminar.value = null
    await cargarLista()
  } catch (error) {
    errorMsg.value = obtenerMensajeError(error, 'No se pudo eliminar el usuario.')
  } finally {
    eliminando.value = false
  }
}

const rolesParaSelect = computed(() =>
  (Object.values(ROLES) as number[]).map((id) => ({
    id,
    label: NOMBRE_ROL_ES[id],
  }))
)

const getRolBadge = (user: Usuario) => {
  const numId = Number(user.rolId);
  if (numId === ROLES.ADMIN) return { text: 'Administrador', class: 'bg-purple-100 text-purple-700' };
  if (numId === ROLES.AGENT) return { text: 'Agente Inmobiliario', class: 'bg-blue-100 text-blue-700' };
  return { text: 'Usuario Básico', class: 'bg-slate-100 text-slate-700' };
};
</script>

<template>
  <AdminLayout titulo="Gestión de Usuarios">
    <div class="max-w-6xl mx-auto flex flex-col gap-6">
      
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h1>
          <p class="text-slate-500 text-sm mt-1">
            {{ puedeCrearEliminarUsuarios ? 'Administra los accesos y roles de la plataforma.' : 'Agente: solo consulta.' }}
          </p>
        </div>
        <button
          v-if="puedeCrearEliminarUsuarios"
          @click="abrirAgregar"
          class="bg-[#003399] hover:bg-blue-800 text-white font-bold text-sm px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2 cursor-pointer"
        >
          <UserPlus class="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        ⚠️ {{ errorMsg }}
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th class="p-4">ID</th>
                <th class="p-4">Nombre</th>
                <th class="p-4">Email</th>
                <th class="p-4">Rol</th>
                <th class="p-4">Estado</th>
                <th v-if="puedeCrearEliminarUsuarios" class="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-if="cargando">
                <td :colspan="puedeCrearEliminarUsuarios ? 6 : 5" class="p-8 text-center text-slate-400 font-medium">Cargando usuarios...</td>
              </tr>
              <tr v-else-if="usuarios.length === 0">
                <td :colspan="puedeCrearEliminarUsuarios ? 6 : 5" class="p-8 text-center text-slate-400 font-medium">No se encontraron usuarios.</td>
              </tr>
              <tr
                v-else
                v-for="user in usuarios"
                :key="user.id"
                class="hover:bg-slate-50 transition-colors"
                :class="esMiCuenta(user) ? 'bg-[#003399]/5' : ''"
              >
                <td class="p-4 text-slate-500 font-mono text-xs">#{{ user.id }}</td>
                <td class="p-4 font-bold text-slate-800">
                  {{ user.nombre }}
                  <span v-if="esMiCuenta(user)" class="ml-1 text-[10px] font-bold uppercase text-[#003399]">(Tú)</span>
                </td>
                <td class="p-4 text-slate-600">{{ user.email }}</td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" :class="getRolBadge(user).class">
                    {{ getRolBadge(user).text }}
                  </span>
                </td>
                <td class="p-4">
                  <span :class="user.activo !== false ? 'text-emerald-600' : 'text-red-500'" class="font-semibold text-xs">
                    {{ user.activo !== false ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td v-if="puedeCrearEliminarUsuarios" class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <!-- <span v-if="esMiCuenta(user)" class="text-xs text-slate-400 font-medium mr-2">Tu cuenta</span> -->
                    <button @click="editarUsuario(user)" class="p-1.5 text-slate-400 hover:text-[#003399] hover:bg-blue-50 rounded transition-colors" title="Editar">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button v-if="!esMiCuenta(user)" @click="solicitarEliminar(user)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Crear Usuario -->
      <Teleport to="body">
        <div v-if="modalAgregar" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-slate-200">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 class="font-black text-slate-800 text-xl">{{ modoEdicion ? 'Editar Usuario' : 'Crear Usuario Interno' }}</h3>
              <button @click="modalAgregar = false" class="text-slate-400 hover:text-slate-700 cursor-pointer text-xl font-bold">&times;</button>
            </div>
            
            <div class="p-6">
              <div v-if="formError" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{{ formError }}</div>
              <form @submit.prevent="guardarUsuario" class="flex flex-col gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                  <input v-model="nuevoNombre" type="text" placeholder="Ej: Carlos Gómez" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" required />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                  <input v-model="nuevoEmail" type="email" placeholder="carlos@empresa.com" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" required />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Contraseña <span v-if="modoEdicion" class="text-[10px] font-normal normal-case text-slate-400">(Opcional)</span>
                  </label>
                  <CampoContrasena
                    v-model="nuevoContrasena"
                    :placeholder="modoEdicion ? 'Nueva contraseña' : 'Asigna una clave temporal'"
                    :required="!modoEdicion"
                    autocomplete="new-password"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Rol del Sistema</label>
                  <select v-model.number="nuevoRolId" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors">
                    <option v-for="r in rolesParaSelect" :key="r.id" :value="r.id">
                      {{ r.label }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-3 mt-4">
                  <button type="button" @click="modalAgregar = false" class="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button type="submit" :disabled="guardando" class="flex-1 bg-[#003399] hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50">
                    {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>

      <ConfirmModal
        :abierto="usuarioAEliminar !== null"
        titulo="Eliminar usuario"
        :mensaje="usuarioAEliminar ? `¿Eliminar a ${usuarioAEliminar.nombre} (${usuarioAEliminar.email})? Esta acción no se puede deshacer.` : ''"
        confirmar-texto="Eliminar"
        cancelar-texto="Cancelar"
        peligro
        :cargando="eliminando"
        @confirmar="confirmarEliminar"
        @cancelar="cancelarEliminar"
      />
    </div>
  </AdminLayout>
</template>
