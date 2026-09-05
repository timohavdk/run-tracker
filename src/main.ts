import { createApp } from 'vue'
import App from './app/app.vue'
import { i18n } from './i18n'

createApp(App).use(i18n).mount('#app')
