import { createRouter, createWebHistory } from "vue-router";
import BookList from "../views/BookList.vue";
// import Connect from '../views/Connect.vue'

const routes = [
  {
    path: "/",
    name: "Home",
    component: BookList,
  },
  // {
  //   path: '/connect',
  //   name: 'Connect',
  //   component: Connect,
  // },
];

const router = createRouter({ history: createWebHistory(), routes });
export default router;
