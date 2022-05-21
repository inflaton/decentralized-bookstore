import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import router from "./router";
import $Event from "./libs/event.js";
import { PromiseDialog } from "vue3-promise-dialog";

const app = createApp(App);

app.config.globalProperties.$Event = $Event;
app.use(PromiseDialog);
app.use(router);

app.mount("#app");
