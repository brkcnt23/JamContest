// router/index.ts
const routes = [
  { path: '/', component: () => import('@/views/Home.vue') },
  { path: '/contests', component: () => import('@/views/Contests.vue') },
  { path: '/contests/:slug', component: () => import('@/views/ContestDetail.vue') },
  { 
    path: '/contests/:slug/submit', 
    component: () => import('@/views/Submit.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/profile/:username', component: () => import('@/views/Profile.vue') },
  {
    path: '/jury',
    component: () => import('@/views/Jury.vue'),
    meta: { requiresRole: 'JURY' }
  },
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresRole: 'ADMIN' }
  },
];