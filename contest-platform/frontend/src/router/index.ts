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
    { 
      path: '/', 
      name: 'Home', 
      component: Home,
      meta: { layout: 'dashboard' } // ← Sidebar + TopHeader
    },
    { 
      path: '/login', 
      name: 'Login', 
      component: Login,
      meta: { layout: 'blank' } // ← Eski Header + Footer
    },
    { 
      path: '/register', 
      name: 'Register', 
      component: Register,
      meta: { layout: 'blank' }
    },
    { 
      path: '/about', 
      name: 'About', 
      component: About,
      meta: { layout: 'blank' }
    },
    { 
      path: '/contests', 
      name: 'Contests', 
      component: Contests,
      meta: { layout: 'dashboard' }
    },
    { 
      path: '/contests/create', 
      name: 'ContestCreate', 
      component: () => import('@/views/ContestCreate.vue'),
      meta: { layout: 'dashboard', requiresAuth: true }
    },
    { 
      path: '/contests/:slug', 
      name: 'ContestDetail', 
      component: () => import('@/views/ContestDetail.vue'),
      meta: { layout: 'dashboard' }
    },
    { 
      path: '/governance', 
      name: 'Governance', 
      component: Governance,
      meta: { layout: 'blank' }
    },
    { 
      path: '/coc', 
      name: 'CoC', 
      component: CoC,
      meta: { layout: 'blank' }
    },
    { 
      path: '/transparency', 
      name: 'Transparency', 
      component: Transparency,
      meta: { layout: 'blank' }
    },
    { 
      path: '/terms', 
      name: 'Terms', 
      component: Terms,
      meta: { layout: 'blank' }
    },
    { 
      path: '/privacy', 
      name: 'Privacy', 
      component: Privacy,
      meta: { layout: 'blank' }
    },
    { 
      path: '/contact', 
      name: 'Contact', 
      component: Contact,
      meta: { layout: 'blank' }
    },
    { 
      path: '/profile', 
      name: 'ProfileRedirect', 
      redirect: () => {
        const authStore = useAuthStore();
        const id = authStore.user?.id;
        return id ? { name: 'UserProfile', params: { id } } : { name: 'Login' };
      } 
    },
    { 
      path: '/user/:id', 
      name: 'UserProfile', 
      component: UserProfile, 
      meta: { layout: 'portfolio' } // ← SIDEBAR YOK! Sadece ArtistHero
    },
    { 
      path: '/user/:id/edit', 
      name: 'EditProfile', 
      component: EditProfile, 
      meta: { layout: 'dashboard', requiresAuth: true } // ← Sidebar + TopHeader
    },
    
    // NEW DASHBOARD PAGES
    { 
      path: '/social', 
      name: 'Social', 
      component: () => import('@/views/Social.vue'),
      meta: { layout: 'dashboard' }
    },
    { 
      path: '/messages', 
      name: 'Messages', 
      component: () => import('@/views/Messages.vue'),
      meta: { layout: 'dashboard', requiresAuth: true }
    },
    { 
      path: '/notifications', 
      name: 'Notifications', 
      component: () => import('@/views/Notifications.vue'),
      meta: { layout: 'dashboard', requiresAuth: true }
    },
    { 
      path: '/submissions', 
      name: 'Submissions', 
      component: () => import('@/views/Submissions.vue'),
      meta: { layout: 'dashboard', requiresAuth: true }
    },
    { 
      path: '/favorites', 
      name: 'Favorites', 
      component: () => import('@/views/Favorites.vue'),
      meta: { layout: 'dashboard', requiresAuth: true }
    },
    { 
      path: '/settings', 
      name: 'Settings', 
      component: () => import('@/views/Settings.vue'),
      meta: { layout: 'dashboard', requiresAuth: true }
    },
    { 
      path: '/help', 
      name: 'Help', 
      component: () => import('@/views/Help.vue'),
      meta: { layout: 'dashboard' }
    },
    { 
      path: '/docs', 
      name: 'Docs', 
      component: () => import('@/views/Docs.vue'),
      meta: { layout: 'dashboard' }
    },
    
    // JURY
    { 
      path: '/jury', 
      name: 'Jury', 
      component: () => import('@/views/Jury.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, requiresJury: true }
    },
    
    // ADMIN
    { 
      path: '/admin', 
      name: 'Admin', 
      component: () => import('@/views/Admin.vue'),
      meta: { layout: 'dashboard', requiresAuth: true, requiresAdmin: true }
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.setupAxiosInterceptor();
  
  // Auth guards
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresJury && !authStore.isJury) {
    next('/');
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/');
  } else {
    next();
  }
});

export default router;