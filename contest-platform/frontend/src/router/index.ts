import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import About from '@/views/About.vue';
import Terms from '@/views/Terms.vue';
import Privacy from '@/views/Privacy.vue';
import Contact from '@/views/Contact.vue';
import CoC from '@/views/CoC.vue';
import Governance from '@/views/Governance.vue';
import Transparency from '@/views/Transparency.vue';
import UserProfile from '@/views/UserProfile.vue';
import EditProfile from '@/edits/EditProfile.vue';
import Contests from '@/views/Contests.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/about', name: 'About', component: About },
    { path: '/contests', name: 'Contests', component: Contests },
    { path: '/governance', name: 'Governance', component: Governance },
    { path: '/coc', name: 'CoC', component: CoC },
    { path: '/transparency', name: 'Transparency', component: Transparency },
    { path: '/terms', name: 'Terms', component: Terms },
    { path: '/privacy', name: 'Privacy', component: Privacy },
    { path: '/contact', name: 'Contact', component: Contact },
    { path: '/profile', name: 'ProfileRedirect', redirect: () => {
      const authStore = useAuthStore();
      const id = authStore.user?.id;
      return id ? { name: 'UserProfile', params: { id } } : { name: 'Login' };
    } },
    { path: '/user/:id', name: 'UserProfile', component: UserProfile, meta: { layout: 'blank' } },
    { path: '/user/:id/edit', name: 'EditProfile', component: EditProfile, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.setupAxiosInterceptor();
  next();
});

export default router;