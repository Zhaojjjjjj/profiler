import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/StartPage.vue'),
    meta: { title: '人格画像生成' }
  },
  {
    path: '/start',
    name: 'Start',
    component: () => import('../views/StartPage.vue'),
    meta: { title: '开始测试' }
  },
  {
    path: '/question',
    name: 'Question',
    component: () => import('../views/QuestionPage.vue'),
    meta: { title: '回答问题' }
  },
  {
    path: '/summary/:id',
    name: 'Summary',
    component: () => import('../views/SummaryPage.vue'),
    meta: { title: '人格画像' }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/ProfileHistory.vue'),
    meta: { title: '历史画像' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '人格画像'} - Personality Profiler`
  next()
})

export default router
