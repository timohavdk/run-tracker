import type { GeoPoint } from '../../types/geo'
import { computed, onUnmounted, ref } from 'vue'

export type GpsStatus = 'idle' | 'requesting' | 'tracking' | 'denied' | 'unavailable' | 'error'

const EARTH_RADIUS_M = 6_371_000
const MAX_ACCURACY_M = 50
const MIN_POINT_DISTANCE_M = 5

/**
 * Переводит градусы в радианы.
 * @param degrees - угол в градусах
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Считает расстояние между двумя точками по формуле гаверсинуса.
 * @param from - начальная точка маршрута
 * @param to - конечная точка маршрута
 */
function haversineMeters(from: GeoPoint, to: GeoPoint): number {
  const dLat = toRad(to.lat - from.lat)
  const dLng = toRad(to.lng - from.lng)
  const lat1 = toRad(from.lat)
  const lat2 = toRad(to.lat)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)))
}

/**
 * Считает суммарную длину ломаной маршрута.
 * @param path - последовательность точек
 */
function pathDistanceMeters(path: GeoPoint[]): number {
  return path.reduce((total, point, index) => {
    if (index === 0)
      return 0
    return total + haversineMeters(path[index - 1], point)
  }, 0)
}

/** Отслеживает GPS-маршрут и накопленную дистанцию. */
export function useRouteTracker() {
  const points = ref<GeoPoint[]>([])
  const gpsStatus = ref<GpsStatus>('idle')
  const distanceMeters = computed(() => pathDistanceMeters(points.value))

  let watchId: number | null = null
  let wakeLock: WakeLockSentinel | null = null

  /**
   * Решает, достаточно ли точна и далека новая точка для записи.
   * @param position - текущая геопозиция браузера
   */
  function shouldKeepPoint(position: GeolocationPosition): boolean {
    if (position.coords.accuracy > MAX_ACCURACY_M && points.value.length > 0)
      return false

    const next: GeoPoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: position.timestamp,
    }

    const last = points.value.at(-1)
    if (!last)
      return true

    return haversineMeters(last, next) >= MIN_POINT_DISTANCE_M
  }

  /**
   * Добавляет точку маршрута, если она проходит фильтр.
   * @param position - текущая геопозиция браузера
   */
  function onPosition(position: GeolocationPosition) {
    if (!shouldKeepPoint(position)) {
      if (gpsStatus.value !== 'tracking')
        gpsStatus.value = 'tracking'
      return
    }

    points.value = [
      ...points.value,
      {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: position.timestamp,
      },
    ]
    gpsStatus.value = 'tracking'
  }

  /**
   * Обрабатывает ошибку геолокации.
   * @param error - ошибка `GeolocationPositionError`
   */
  function onError(error: GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) {
      gpsStatus.value = 'denied'
      clearWatch()
      return
    }

    gpsStatus.value = navigator.geolocation ? 'error' : 'unavailable'
  }

  /** Запрашивает блокировку экрана на время трекинга. */
  function acquireWakeLock() {
    const request = navigator.wakeLock?.request('screen')
    if (!request)
      return

    request
      .then((lock) => {
        wakeLock = lock
      })
      .catch(() => {
        wakeLock = null
      })
  }

  /** Снимает блокировку экрана. */
  function releaseWakeLock() {
    wakeLock?.release().catch(() => {})
    wakeLock = null
  }

  /** Возобновляет wake lock после возврата на вкладку. */
  function onVisibilityChange() {
    if (document.visibilityState === 'visible' && watchId !== null)
      acquireWakeLock()
  }

  /** Останавливает watch геолокации и снимает wake lock. */
  function clearWatch() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }

    document.removeEventListener('visibilitychange', onVisibilityChange)
    releaseWakeLock()
  }

  /** Начинает слежение за геопозицией. */
  function startTracking() {
    if (watchId !== null)
      return

    if (!navigator.geolocation) {
      gpsStatus.value = 'unavailable'
      return
    }

    gpsStatus.value = 'requesting'
    document.addEventListener('visibilitychange', onVisibilityChange)
    acquireWakeLock()

    watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15_000,
    })
  }

  /** Приостанавливает слежение, сохраняя накопленные точки. */
  function stopTracking() {
    clearWatch()

    if (gpsStatus.value === 'requesting' || gpsStatus.value === 'tracking')
      gpsStatus.value = 'idle'
  }

  /** Останавливает слежение и очищает маршрут. */
  function resetTracking() {
    stopTracking()
    points.value = []
    gpsStatus.value = 'idle'
  }

  /** Возвращает снимок текущего маршрута и дистанции. */
  function snapshot() {
    return {
      points: [...points.value],
      distanceMeters: distanceMeters.value,
    }
  }

  onUnmounted(resetTracking)

  return {
    points,
    distanceMeters,
    gpsStatus,
    startTracking,
    stopTracking,
    resetTracking,
    snapshot,
  }
}
