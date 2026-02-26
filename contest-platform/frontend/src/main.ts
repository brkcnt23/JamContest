// Import global CSS styles
import "./index.css"
import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"
import axios from "axios"
import i18n from "./i18n"
import { useAuthStore } from "@/stores/auth"

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Initialize auth store and setup interceptors before router
const authStore = useAuthStore()
authStore.init()

app.use(router)
app.use(i18n)
app.mount("#app")
