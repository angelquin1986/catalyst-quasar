const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/dashboard/DashboardPage.vue') },
      { path: '/SystemMaintenance', component: () => import('pages/settings/system/SystemMaintenance.vue') },
      { path: '/matches', component: () => import('pages/matches/MatchesPage.vue') },
      { path: '/leaderboard', component: () => import('pages/leaderboard/LeaderboardPage.vue') },
      { path: '/calendar', component: () => import('pages/calendar/CalendarPage.vue') },
      { path: '/teams', component: () => import('pages/teams/TeamsPage.vue') },
      { path: '/teams/:teamId/players', component: () => import('pages/teams/TeamPlayersPage.vue') },
      { path: '/users', component: () => import('pages/users/UsersAdminPage.vue') }
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
