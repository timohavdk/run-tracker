<script setup lang="ts">
import type { RunRecord } from '../../composables/use-run-timer'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDistance } from '../../composables/use-route-tracker'
import { formatDuration } from '../../composables/use-run-timer'
import RunMap from '../run-map/run-map.vue'
import styles from './run-history.module.scss'

defineProps<{
  history: RunRecord[]
}>()

const { t, locale } = useI18n()
const selectedId = ref<string | null>(null)

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function toggle(id: string) {
  selectedId.value = selectedId.value === id ? null : id
}
</script>

<template>
  <section>
    <h2 :class="styles.title">
      {{ t('history.title') }}
    </h2>

    <p v-if="history.length === 0" :class="styles.empty">
      {{ t('history.empty') }}
    </p>

    <ul v-else :class="styles.list">
      <li v-for="run in history" :key="run.id" :class="styles.item">
        <button
          type="button"
          :class="styles.summary"
          :aria-expanded="selectedId === run.id"
          @click="toggle(run.id)"
        >
          <span :class="styles.date">{{ formatDate(run.startedAt) }}</span>
          <span :class="styles.stats">
            <span>{{ formatDuration(run.durationMs) }}</span>
            <span>{{ formatDistance(run.distanceMeters, locale) }}</span>
          </span>
        </button>
        <run-map
          v-if="selectedId === run.id"
          :path="run.path"
          :empty-label="t('route.noPath')"
        />
      </li>
    </ul>
  </section>
</template>
