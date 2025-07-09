const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/SystemMaintenance', component: () => import('pages/settings/system/SystemMaintenance.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  },
  {
    path: '/login',
    component: () => import('pages/login/LoginPage.vue')
  }
]
// Add meta.requiresAuth dynamically to all routes except excluded ones
const excludedPaths = ['/login']
routes.forEach(route => {
  if (!excludedPaths.includes(route.path)) {
    route.meta = { requiresAuth: true }
  }
})

export default routes
