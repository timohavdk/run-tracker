<script setup lang="ts">
import type { AppLocale } from '../../i18n'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../i18n'
import BaseButton from '../base/base-button/base-button.vue'
import styles from './language-switcher.module.scss'

const { locale } = useI18n()

const options: { value: AppLocale, label: string }[] = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
]

/**
 * Переключает язык интерфейса.
 * @param lang - выбранная локаль
 */
function select(lang: AppLocale) {
  setLocale(lang)
}
</script>

<template>
  <div :class="styles.root" role="group" :aria-label="$t('lang.label')">
    <base-button
      v-for="option in options"
      :key="option.value"
      variant="chip"
      :active="locale === option.value"
      @click="select(option.value)"
    >
      {{ option.label }}
    </base-button>
  </div>
</template>
