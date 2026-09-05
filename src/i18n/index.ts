import { createI18n } from 'vue-i18n'
import en from './locales/en'
import ru from './locales/ru'

export type AppLocale = 'en' | 'ru'

const STORAGE_KEY = 'run-tracker-locale'

function getInitialLocale(): AppLocale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ru')
    return stored

  const browser = navigator.language.toLowerCase()
  return browser.startsWith('ru') ? 'ru' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, ru },
})

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

document.documentElement.lang = getInitialLocale()
