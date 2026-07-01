import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import CatalogoView from '../views/CatalogoView.vue';
import { authService } from '../services/usuarios';
import { esUsuarioEstandar, puedeListarUsuarios } from '../constants/roles';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'catalogo',
    component: CatalogoView,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/olvide-contrasena',
    name: 'olvide-contrasena',
    component: () => import('../views/OlvideContrasenaView.vue'),
  },
  {
    path: '/restablecer-contrasena',
    name: 'restablecer-contrasena',
    component: () => import('../views/RestablecerContrasenaView.vue'),
  },
  {
    path: '/propiedad/:id',
    name: 'detalle',
    component: () => import('../views/DetalleView.vue'),
  },
  {
    path: '/admin/nuevo-proyecto',
    name: 'admin-form',
    meta: { requiresAdmin: true },
    component: () => import('../views/AdminFormView.vue'),
  },
  {
    path: '/admin/usuarios',
    name: 'admin-usuarios',
    meta: { requiresAdmin: true, requiresUserList: true },
    component: () => import('../views/AdminUsuariosView.vue'),
  },
  {
    path: '/admin/perfil',
    name: 'admin-perfil',
    meta: { requiresAdmin: true },
    component: () => import('../views/AdminPerfilView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

async function resolverRolId(): Promise<number | null> {
  let rolId = authService.obtenerRolIdLocal();
  if (rolId === null && authService.estaAutenticado()) {
    try {
      await authService.obtenerPerfil();
      rolId = authService.obtenerRolIdLocal();
    } catch {
      return null;
    }
  }
  return rolId;
}

router.beforeEach(async (to) => {
  if (to.meta.requiresAdmin) {
    if (!authService.estaAutenticado()) {
      return { name: 'login' };
    }

    const rolId = await resolverRolId();
    if (rolId === null) return { name: 'login' };

    if (esUsuarioEstandar(rolId)) {
      return { name: 'catalogo' };
    }

    if (to.meta.requiresUserList && !puedeListarUsuarios(rolId)) {
      return { name: 'admin-form' };
    }
  }
});

export default router;
