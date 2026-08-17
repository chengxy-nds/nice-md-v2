import { createRouter, createWebHashHistory } from 'vue-router';

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
  history: createWebHashHistory(),
  routes,
});

export default router;
