import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('./pages/ProEditorPage.vue'),
  },
  {
    path: '/index2',
    component: () => import('./components/SaaSProView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
