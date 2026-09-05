import type { GeoPoint } from './use-route-tracker'
import { computed, onUnmounted, ref } from 'vue'

export type RunStatus = 'idle' | 'running' | 'paused'

export interface RunRecord {
  id: string
  startedAt: string
  durationMs: number
  distanceMeters: number
  path: GeoPoint[]
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0)
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  return `${pad(minutes)}:${pad(seconds)}`
}

export function useRunTimer() {
  const status = ref<RunStatus>('idle')
  const elapsedMs = ref(0)

  let intervalId: ReturnType<typeof setInterval> | null = null
  let segmentStartedAt: number | null = null
  let accumulatedMs = 0

  const displayTime = computed(() => formatDuration(elapsedMs.value))

  function clearIntervalSafe() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function tick() {
    if (segmentStartedAt === null)
      return
    elapsedMs.value = accumulatedMs + (Date.now() - segmentStartedAt)
  }

  function startInterval() {
    clearIntervalSafe()
    intervalId = setInterval(tick, 200)
  }

  function start() {
    if (status.value === 'running')
      return

    segmentStartedAt = Date.now()
    status.value = 'running'
    startInterval()
  }

  function pause() {
    if (status.value !== 'running' || segmentStartedAt === null)
      return

    accumulatedMs += Date.now() - segmentStartedAt
    elapsedMs.value = accumulatedMs
    segmentStartedAt = null
    clearIntervalSafe()
    status.value = 'paused'
  }

  function resume() {
    if (status.value !== 'paused')
      return
    start()
  }

  function reset() {
    clearIntervalSafe()
    status.value = 'idle'
    elapsedMs.value = 0
    accumulatedMs = 0
    segmentStartedAt = null
  }

  function stop(): RunRecord | undefined {
    if (status.value === 'idle')
      return

    if (status.value === 'running' && segmentStartedAt !== null)
      accumulatedMs += Date.now() - segmentStartedAt

    const durationMs = accumulatedMs
    let record: RunRecord | undefined

    if (durationMs > 0) {
      record = {
        id: crypto.randomUUID(),
        startedAt: new Date().toISOString(),
        durationMs,
        distanceMeters: 0,
        path: [],
      }
    }

    reset()
    return record
  }

  onUnmounted(clearIntervalSafe)

  return {
    status,
    displayTime,
    start,
    pause,
    resume,
    stop,
    reset,
  }
}
