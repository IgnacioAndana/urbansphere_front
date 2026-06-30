<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UserPlus, Pencil, Trash2 } from 'lucide-vue-next';
import AdminLayout from '../layouts/AdminLayout.vue';
import { authService } from '../services/authService';

const usuarios = ref<any[]>([]);
const cargando = ref(true);
const errorMsg = ref('');

// Variables del Modal de Creación/Edición
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const usuarioEdicionId = ref<number | null>(null);
const nuevoUsuario = ref({ nombre: '', email: '', contrasena: '', rolId: 3 });
const creandoUsuario = ref(false);

const cargarUsuarios = async () => {
  cargando.value = true;
  errorMsg.value = '';
  try {
    usuarios.value = await authService.getUsers();
  } catch (error: any) {
    console.error(error);
    errorMsg.value = 'Error al cargar los usuarios. Verifica tu conexión o sesión.';
  } finally {
    cargando.value = false;
  }
};

const abrirModalCrear = () => {
  modoEdicion.value = false;
  usuarioEdicionId.value = null;
  nuevoUsuario.value = { nombre: '', email: '', contrasena: '', rolId: 3 };
  mostrarModal.value = true;
};

const manejarCrearUsuario = async () => {
  creandoUsuario.value = true;
  try {
    if (modoEdicion.value && usuarioEdicionId.value) {
      // En edición no enviamos la contraseña si está en blanco
      const dataAEnviar: any = { 
        nombre: nuevoUsuario.value.nombre, 
        email: nuevoUsuario.value.email, 
        rolId: nuevoUsuario.value.rolId 
      };
      if (nuevoUsuario.value.contrasena.trim() !== '') {
        dataAEnviar.contrasena = nuevoUsuario.value.contrasena;
      }
      await authService.updateUser(usuarioEdicionId.value, dataAEnviar);
    } else {
      await authService.register(nuevoUsuario.value);
    }
    mostrarModal.value = false;
    cargarUsuarios();
  } catch (error: any) {
    alert('Error al guardar usuario: ' + (error.response?.data?.message || 'Verifica la conexión.'));
  } finally {
    creandoUsuario.value = false;
  }
};

onMounted(() => {
  cargarUsuarios();
});

const eliminarUsuario = async (id: number, nombre: string) => {
  if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) {
    try {
      await authService.deleteUser(id);
      // Recargar lista después de eliminar
      cargarUsuarios();
    } catch (error: any) {
      alert('Hubo un error al eliminar el usuario. ' + (error.response?.data?.message || ''));
    }
  }
};

const editarUsuario = (usuario: any) => {
  modoEdicion.value = true;
  usuarioEdicionId.value = usuario.id;
  const rId = usuario.rolId || usuario.rol_id || (usuario.rol && usuario.rol.id) || 2;
  nuevoUsuario.value = { 
    nombre: usuario.nombre, 
    email: usuario.email, 
    contrasena: '', 
    rolId: Number(rId)
  };
  mostrarModal.value = true;
};

const getRolBadge = (user: any) => {
  const rId = user.rolId || user.rol_id || (user.rol && user.rol.id) || 2;
  const numId = Number(rId);
  if (numId === 1) return { text: 'Administrador', class: 'bg-purple-100 text-purple-700' };
  if (numId === 3) return { text: 'Agente Inmobiliario', class: 'bg-blue-100 text-blue-700' };
  return { text: 'Usuario Básico', class: 'bg-slate-100 text-slate-700' };
};
</script>

<template>
  <AdminLayout>
    <div class="max-w-6xl mx-auto flex flex-col gap-6">
      
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h1>
          <p class="text-slate-500 text-sm mt-1">Administra los accesos y roles de la plataforma.</p>
        </div>
        <button @click="abrirModalCrear" class="bg-[#003399] hover:bg-blue-800 text-white font-bold text-sm px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2 cursor-pointer">
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
                <th class="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-if="cargando">
                <td colspan="5" class="p-8 text-center text-slate-400 font-medium">Cargando usuarios...</td>
              </tr>
              <tr v-else-if="usuarios.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-400 font-medium">No se encontraron usuarios.</td>
              </tr>
              <tr v-else v-for="user in usuarios" :key="user.id" class="hover:bg-slate-50 transition-colors">
                <td class="p-4 text-slate-500 font-mono text-xs">#{{ user.id }}</td>
                <td class="p-4 font-bold text-slate-800">{{ user.nombre }}</td>
                <td class="p-4 text-slate-600">{{ user.email }}</td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" :class="getRolBadge(user).class">
                    {{ getRolBadge(user).text }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="editarUsuario(user)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button @click="eliminarUsuario(user.id, user.nombre)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Crear/Editar Usuario -->
      <div v-if="mostrarModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 class="font-black text-slate-800 text-xl">{{ modoEdicion ? 'Editar Usuario' : 'Crear Usuario Interno' }}</h3>
            <button @click="mostrarModal = false" class="text-slate-400 hover:text-slate-700 cursor-pointer text-xl font-bold">&times;</button>
          </div>
          
          <div class="p-6">
            <form @submit.prevent="manejarCrearUsuario" class="flex flex-col gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                <input v-model="nuevoUsuario.nombre" type="text" placeholder="Ej: Carlos Gómez" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" required />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                <input v-model="nuevoUsuario.email" type="email" placeholder="carlos@empresa.com" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" required />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Contraseña <span v-if="modoEdicion" class="text-[10px] font-normal normal-case text-slate-400">(Opcional, dejar en blanco para no cambiar)</span>
                </label>
                <input v-model="nuevoUsuario.contrasena" type="text" :placeholder="modoEdicion ? 'Nueva contraseña' : 'Asigna una clave temporal'" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors" :required="!modoEdicion" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Rol del Sistema</label>
                <select v-model="nuevoUsuario.rolId" class="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:outline-none focus:border-[#003399] focus:bg-white transition-colors">
                  <option :value="3">Agente Inmobiliario (Solo publicar)</option>
                  <option :value="1">Administrador (Acceso total)</option>
                  <option :value="2">Usuario Normal (Básico)</option>
                </select>
              </div>

              <div class="flex gap-3 mt-4">
                <button type="button" @click="mostrarModal = false" class="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" :disabled="creandoUsuario" class="flex-1 bg-[#003399] hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50">
                  {{ creandoUsuario ? 'Guardando...' : (modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>
