import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import CatalogoView from '../views/CatalogoView.vue';
import { authService } from '../services/usuarios';
import { esUsuarioEstandar } from '../constants/roles';

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.meta.requiresAdmin) {
    if (!authService.estaAutenticado()) {
      return { name: 'login' };
    }

    let rolId = authService.obtenerRolIdLocal();
    if (rolId === null) {
      try {
        await authService.obtenerPerfil();
        rolId = authService.obtenerRolIdLocal();
      } catch {
        return { name: 'login' };
      }
    }

    if (esUsuarioEstandar(rolId)) {
      return { name: 'catalogo' };
    }
  }
});

export default router;
