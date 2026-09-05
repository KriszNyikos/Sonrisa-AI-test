import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Simple routing setup
const routes = [
  { path: '/', component: () => import('./pages/Home.vue') },
  { path: '/alerts', component: () => import('./pages/Alerts.vue') },
  { path: '/news', component: () => import('./pages/NewsFeed.vue') },
  { path: '/admin', component: () => import('./pages/Admin.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')
