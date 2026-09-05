<script setup lang="ts">
import type { RunRecord } from '../../composables/use-run-timer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDistance, useRouteTracker } from '../../composables/use-route-tracker'
import { useRunTimer } from '../../composables/use-run-timer'
import RunMap from '../run-map/run-map.vue'
import styles from './run-timer.module.scss'

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

function begin() {
  start()
  startTracking()
}

function hold() {
  pause()
  stopTracking()
}

function continueRun() {
  resume()
  startTracking()
}

function discard() {
  reset()
  resetTracking()
}

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
    <p :class="styles.status">
      {{ statusLabel }}
    </p>
    <p :class="styles.display" aria-live="polite">
      {{ displayTime }}
    </p>
    <p :class="styles.distance">
      {{ distanceLabel }}
    </p>
    <p v-if="gpsLabel" :class="styles.gps">
      {{ gpsLabel }}
    </p>

    <run-map
      v-if="isActive"
      :path="points"
      follow
      :empty-label="t('route.waiting')"
    />

    <div :class="styles.actions">
      <button
        v-if="status === 'idle'"
        type="button"
        :class="[styles.btn, styles.primary]"
        @click="begin"
      >
        {{ t('timer.start') }}
      </button>

      <template v-else-if="status === 'running'">
        <button type="button" :class="[styles.btn, styles.secondary]" @click="hold">
          {{ t('timer.pause') }}
        </button>
        <button type="button" :class="[styles.btn, styles.primary]" @click="finish">
          {{ t('timer.stop') }}
        </button>
      </template>

      <template v-else>
        <button type="button" :class="[styles.btn, styles.secondary]" @click="continueRun">
          {{ t('timer.resume') }}
        </button>
        <button type="button" :class="[styles.btn, styles.primary]" @click="finish">
          {{ t('timer.stop') }}
        </button>
        <button type="button" :class="[styles.btn, styles.ghost]" @click="discard">
          {{ t('timer.reset') }}
        </button>
      </template>
    </div>
  </section>
</template>
