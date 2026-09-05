import type { RunRecord, RunStatus } from '../../types/run'
import { computed, onUnmounted, ref } from 'vue'
import { formatDuration } from '../../utils/format'

/** Управляет статусом и накопленным временем пробежки. */
export function useRunTimer() {
  const status = ref<RunStatus>('idle')
  const elapsedMs = ref(0)

  let intervalId: ReturnType<typeof setInterval> | null = null
  let segmentStartedAt: number | null = null
  let accumulatedMs = 0

  const displayTime = computed(() => formatDuration(elapsedMs.value))

  /** Останавливает интервал обновления таймера. */
  function clearIntervalSafe() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  /** Пересчитывает прошедшее время текущего сегмента. */
  function tick() {
    if (segmentStartedAt === null)
      return
    elapsedMs.value = accumulatedMs + (Date.now() - segmentStartedAt)
  }

  /** Запускает периодическое обновление таймера. */
  function startInterval() {
    clearIntervalSafe()
    intervalId = setInterval(tick, 200)
  }

  /** Начинает новый сегмент пробежки. */
  function start() {
    if (status.value === 'running')
      return

    segmentStartedAt = Date.now()
    status.value = 'running'
    startInterval()
  }

  /** Ставит текущий сегмент на паузу. */
  function pause() {
    if (status.value !== 'running' || segmentStartedAt === null)
      return

    accumulatedMs += Date.now() - segmentStartedAt
    elapsedMs.value = accumulatedMs
    segmentStartedAt = null
    clearIntervalSafe()
    status.value = 'paused'
  }

  /** Продолжает пробежку после паузы. */
  function resume() {
    if (status.value !== 'paused')
      return
    start()
  }

  /** Сбрасывает таймер в исходное состояние. */
  function reset() {
    clearIntervalSafe()
    status.value = 'idle'
    elapsedMs.value = 0
    accumulatedMs = 0
    segmentStartedAt = null
  }

  /** Останавливает пробежку и возвращает запись, если время больше нуля. */
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
