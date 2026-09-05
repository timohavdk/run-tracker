<script setup lang="ts">
import type { RunRecord } from '../../types/run'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDistance } from '../../utils/format'
import BaseButton from '../base/base-button/base-button.vue'
import BaseText from '../base/typography/base-text/base-text.vue'
import RunMap from '../run-map/run-map.vue'
import styles from './run-timer.module.scss'
import { useRouteTracker } from './use-route-tracker'
import { useRunTimer } from './use-run-timer'

const emit = defineEmits<{
  complete: [record: RunRecord]
}>()

const { t, locale } = useI18n()
const { status, displayTime, start, pause, resume, stop, reset } = useRunTimer()
const {
  points,
  distanceMeters,
  gpsStatus,
  startTracking,
  stopTracking,
  resetTracking,
  snapshot,
} = useRouteTracker()

const statusLabel = computed(() => {
  switch (status.value) {
    case 'running':
      return t('timer.running')
    case 'paused':
      return t('timer.paused')
    default:
      return t('timer.idle')
  }
})

const gpsLabel = computed(() => {
  switch (gpsStatus.value) {
    case 'requesting':
      return t('route.waiting')
    case 'tracking':
      return t('route.tracking')
    case 'denied':
      return t('route.denied')
    case 'unavailable':
      return t('route.unavailable')
    case 'error':
      return t('route.error')
    default:
      return ''
  }
})

const distanceLabel = computed(() => formatDistance(distanceMeters.value, locale.value))
const isActive = computed(() => status.value !== 'idle')

/** Запускает таймер и GPS-трекинг. */
function begin() {
  start()
  startTracking()
}

/** Ставит пробежку на паузу. */
function hold() {
  pause()
  stopTracking()
}

/** Продолжает пробежку после паузы. */
function continueRun() {
  resume()
  startTracking()
}

/** Сбрасывает текущую пробежку без сохранения. */
function discard() {
  reset()
  resetTracking()
}

/** Завершает пробежку и отдаёт запись в историю. */
function finish() {
  const record = stop()
  const route = snapshot()
  resetTracking()

  if (!record)
    return

  emit('complete', {
    ...record,
    distanceMeters: route.distanceMeters,
    path: route.points,
  })
}
</script>

<template>
  <section :class="styles.root">
    <base-text size="sm" :class="styles.status">
      {{ statusLabel }}
    </base-text>
    <base-text size="display" color="default" :class="styles.display" aria-live="polite">
      {{ displayTime }}
    </base-text>
    <base-text size="xl" color="default">
      {{ distanceLabel }}
    </base-text>
    <base-text v-if="gpsLabel" size="xs">
      {{ gpsLabel }}
    </base-text>

    <run-map
      v-if="isActive"
      :path="points"
      follow
      :empty-label="t('route.waiting')"
    />

    <div :class="styles.actions">
      <base-button
        v-if="status === 'idle'"
        @click="begin"
      >
        {{ t('timer.start') }}
      </base-button>

      <template v-else-if="status === 'running'">
        <base-button variant="secondary" @click="hold">
          {{ t('timer.pause') }}
        </base-button>
        <base-button @click="finish">
          {{ t('timer.stop') }}
        </base-button>
      </template>

      <template v-else>
        <base-button variant="secondary" @click="continueRun">
          {{ t('timer.resume') }}
        </base-button>
        <base-button @click="finish">
          {{ t('timer.stop') }}
        </base-button>
        <base-button variant="ghost" @click="discard">
          {{ t('timer.reset') }}
        </base-button>
      </template>
    </div>
  </section>
</template>
