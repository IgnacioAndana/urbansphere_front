import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import CatalogoView from '../views/CatalogoView.vue';
import { authService } from '../services/usuarios';
import { esUsuarioEstandar, puedeListarUsuarios } from '../constants/roles';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'inicio',
    component: () => import('../views/InicioView.vue') // Landing Page
  },
  {
    path: '/catalogo',
    name: 'catalogo',
    component: CatalogoView,
  },
  {
    path: '/contacto',
    name: 'contacto',
    component: () => import('../views/ContactoView.vue') // Formulario RabbitMQ
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
    path: '/registro',
    name: 'registro',
    component: () => import('../views/RegisterView.vue') // Vista de registro
  },
  {
    path: '/propiedad/:id',
    name: 'detalle',
    component: () => import('../views/DetalleView.vue'),
  },
  {
    path: '/admin/proyectos',
    name: 'admin-proyectos',
    meta: { requiresAdmin: true },
    component: () => import('../views/AdminProyectosView.vue'),
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
  {
    path: '/reservas',
    name: 'user-reservas',
    component: () => import('../views/UserReservasView.vue'), // Panel del usuario
    meta: { requiresAuth: true } // Adaptado al logic de HEAD o simplemente requiere auth
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('../views/PerfilView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    redirect: '/admin/proyectos'
  },
  {
    path: '/admin/nuevo-proyecto',
    redirect: '/admin/proyectos'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
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
  if (to.meta.requiresAdmin || to.meta.requiresAuth) {
    if (!authService.estaAutenticado()) {
      return { name: 'login', query: { returnTo: to.fullPath } };
    }

    const rolId = await resolverRolId();
    if (rolId === null) return { name: 'login', query: { returnTo: to.fullPath } };

    if (to.meta.requiresAdmin) {
      if (esUsuarioEstandar(rolId)) {
        return { name: 'user-reservas' };
      }

      if (to.meta.requiresUserList && !puedeListarUsuarios(rolId)) {
        return { name: 'admin-proyectos' };
      }
    }
  }
});

router.afterEach((to) => {
  if (to.name) {
    const routeName = String(to.name);
    const formattedName = routeName.charAt(0).toUpperCase() + routeName.slice(1).replace(/-/g, ' ');
    document.title = `UrbanSphere - ${formattedName}`;
  } else {
    document.title = 'UrbanSphere';
  }
});

export default router;
