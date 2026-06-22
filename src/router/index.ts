import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import CatalogoView from '../views/CatalogoView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'catalogo',
    component: CatalogoView // Pantalla principal pública (Buscador + Mapa)
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue') // Carga perezosa por rendimiento
  },
  {
    path: '/propiedad/:id',
    name: 'detalle',
    component: () => import('../views/DetalleView.vue') // Ficha técnica + Visor 360
  },
  {
    path: '/admin/nuevo-proyecto',
    name: 'admin-form',
    component: () => import('../views/AdminFormView.vue') // Formulario de carga + Gemini
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;