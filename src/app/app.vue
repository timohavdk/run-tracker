<script setup lang="ts">
import BaseText from '../components/base/typography/base-text/base-text.vue'
import BaseTitle from '../components/base/typography/base-title/base-title.vue'
import LanguageSwitcher from '../components/language-switcher/language-switcher.vue'
import RunHistory from '../components/run-history/run-history.vue'
import RunTimer from '../components/run-timer/run-timer.vue'
import styles from './app.module.scss'
import { useRunHistory } from './use-run-history'

const { history, addRun } = useRunHistory()
</script>

<template>
  <div :class="styles.root">
    <header :class="styles.header">
      <div :class="styles.brand">
        <base-title as="h1" size="lg">
          {{ $t('app.title') }}
        </base-title>
        <base-text size="xs">
          {{ $t('app.tagline') }}
        </base-text>
      </div>
      <language-switcher />
    </header>

    <main :class="styles.main">
      <run-timer @complete="addRun" />
      <run-history :history="history" />
    </main>
  </div>
</template>
