import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/',          name: 'lang',     component: () => import('@/views/LangView.vue') },
  { path: '/onboard',   name: 'onboard',  component: () => import('@/views/OnboardView.vue') },
  { path: '/home',      name: 'home',     component: () => import('@/views/HomeView.vue') },
  { path: '/order',     name: 'order',    component: () => import('@/views/OrderView.vue') },
  { path: '/thanks',    name: 'thanks',   component: () => import('@/views/ThanksView.vue') },
  { path: '/countries', name: 'countries',component: () => import('@/views/CountriesView.vue') },
  { path: '/country/:id', name: 'country',component: () => import('@/views/CountryView.vue') },
  { path: '/mytour',    name: 'mytour',   component: () => import('@/views/MyTourView.vue') },
  { path: '/safe',      name: 'safe',     component: () => import('@/views/SafeView.vue') },
  { path: '/support',   name: 'support',  component: () => import('@/views/SupportView.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
