<script setup lang="ts">
import LanguageSwitcher from '../components/language-switcher/language-switcher.vue'
import RunHistory from '../components/run-history/run-history.vue'
import RunTimer from '../components/run-timer/run-timer.vue'
import { useRunHistory } from '../composables/use-run-history'
import styles from './app.module.scss'

const { history, addRun } = useRunHistory()
</script>

<template>
  <div :class="styles.root">
    <header :class="styles.header">
      <div :class="styles.brand">
        <h1 :class="styles.title">
          {{ $t('app.title') }}
        </h1>
        <p :class="styles.tagline">
          {{ $t('app.tagline') }}
        </p>
      </div>
      <language-switcher />
    </header>

    <main :class="styles.main">
      <run-timer @complete="addRun" />
      <run-history :history="history" />
    </main>
  </div>
</template>
