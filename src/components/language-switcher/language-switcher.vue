<script setup lang="ts">
import type { AppLocale } from '../../i18n'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../i18n'
import styles from './language-switcher.module.scss'

const { locale } = useI18n()

const options: { value: AppLocale, label: string }[] = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
]

function select(lang: AppLocale) {
  setLocale(lang)
}
</script>

<template>
  <div :class="styles.root" role="group" :aria-label="$t('lang.label')">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="[styles.btn, locale === option.value && styles.active]"
      @click="select(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
