import { createRouter, createWebHistory } from 'vue-router'
import BookList from '../views/BookList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: BookList,
  },
]

const router = createRouter({ history: createWebHistory(), routes })
export default router
