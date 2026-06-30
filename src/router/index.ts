import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'inicio',
    component: () => import('../views/InicioView.vue') // Landing Page
  },
  {
    path: '/catalogo',
    name: 'catalogo',
    component: () => import('../views/CatalogoView.vue') // Buscador + Mapa
  },
  {
    path: '/contacto',
    name: 'contacto',
    component: () => import('../views/ContactoView.vue') // Formulario RabbitMQ
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue') // Carga perezosa por rendimiento
  },
  {
    path: '/registro',
    name: 'registro',
    component: () => import('../views/RegisterView.vue') // Vista de registro
  },
  {
    path: '/propiedad/:id',
    name: 'detalle',
    component: () => import('../views/DetalleView.vue') // Ficha técnica + Visor 360
  },
  {
    path: '/admin/nuevo-proyecto',
    name: 'admin-form',
    component: () => import('../views/AdminFormView.vue'), // Formulario de carga + Gemini
    meta: { requiresAuth: true, roles: [1, 3] }
  },
  {
    path: '/admin/usuarios',
    name: 'admin-usuarios',
    component: () => import('../views/AdminUsuariosView.vue'), // Listado de usuarios
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/reservas',
    name: 'user-reservas',
    component: () => import('../views/UserReservasView.vue'), // Panel del usuario
    meta: { requiresAuth: true, roles: [2] } // Solo Usuario
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard (RBAC)
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth as boolean;
  const roles = to.meta.roles as number[];
  
  const token = localStorage.getItem('urbansphere_token');
  const userStr = localStorage.getItem('urbansphere_user');
  
  let rolId: number | null = null;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      // Aseguramos que sea un número (el backend a veces lo devuelve como string)
      rolId = u.rolId ? Number(u.rolId) : (u.rol === 'admin' ? 1 : (u.rol === 'agent' ? 3 : 2));
    } catch(e) {}
  }

  // Si no requiere autenticación, pasar
  if (!requiresAuth) {
    return next();
  }

  // Si requiere autenticación y no hay token, al login
  if (requiresAuth && !token) {
    return next('/login');
  }

  // Si tiene un rol requerido y el usuario no califica
  if (roles && roles.length > 0 && rolId !== null && !roles.includes(rolId)) {
    // Redirigir según su rol si intenta entrar a donde no debe
    if (rolId === 2) {
      if (to.path === '/reservas') return next('/'); // Evitar loop si la meta de reservas cambia
      return next('/reservas');
    } else {
      if (to.path === '/admin/nuevo-proyecto') return next('/'); // Evitar loop
      return next('/admin/nuevo-proyecto');
    }
  }

  next();
});

export default router;