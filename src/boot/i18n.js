import { createI18n } from 'vue-i18n'
import es from 'src/i18n/es.json'
import en from 'src/i18n/en.json'

const messages = { es, en }

function getDefaultLocale() {
  const saved = localStorage.getItem('locale')
  if (saved) return saved
  const browser = navigator.language.split('-')[0]
  return ['es', 'en'].includes(browser) ? browser : 'es'
}

const i18n = createI18n({
  legacy: false, // Habilita Composition API
  locale: getDefaultLocale(),
  fallbackLocale: 'es',
  messages
})

export default ({ app }) => {
  app.use(i18n)
}

export { i18n } 