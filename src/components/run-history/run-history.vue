<script setup lang="ts">
import type { RunRecord } from '../../types/run'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate, formatDistance, formatDuration } from '../../utils/format'
import BaseText from '../base/typography/base-text/base-text.vue'
import BaseTitle from '../base/typography/base-title/base-title.vue'
import RunMap from '../run-map/run-map.vue'
import styles from './run-history.module.scss'

defineProps<{
  history: RunRecord[]
}>()

const { t, locale } = useI18n()
const selectedId = ref<string | null>(null)

/**
 * Раскрывает или скрывает карту выбранной пробежки.
 * @param id - идентификатор записи
 */
function toggle(id: string) {
  selectedId.value = selectedId.value === id ? null : id
}
</script>

<template>
  <section>
    <base-title size="sm" color="muted" :class="styles.title">
      {{ t('history.title') }}
    </base-title>

    <base-text v-if="history.length === 0">
      {{ t('history.empty') }}
    </base-text>

    <ul v-else :class="styles.list">
      <li v-for="run in history" :key="run.id" :class="styles.item">
        <button
          type="button"
          :class="styles.summary"
          :aria-expanded="selectedId === run.id"
          @click="toggle(run.id)"
        >
          <base-text as="span" size="sm">
            {{ formatDate(run.startedAt, locale) }}
          </base-text>
          <span :class="styles.stats">
            <base-text as="span" color="default">
              {{ formatDuration(run.durationMs) }}
            </base-text>
            <base-text as="span" color="default">
              {{ formatDistance(run.distanceMeters, locale) }}
            </base-text>
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
