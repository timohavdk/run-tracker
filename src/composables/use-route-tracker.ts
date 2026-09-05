import { computed, onUnmounted, ref } from 'vue'

export interface GeoPoint {
  lat: number
  lng: number
  timestamp: number
}

export type GpsStatus = 'idle' | 'requesting' | 'tracking' | 'denied' | 'unavailable' | 'error'

const EARTH_RADIUS_M = 6_371_000
const MAX_ACCURACY_M = 50
const MIN_POINT_DISTANCE_M = 5

export function haversineMeters(from: GeoPoint, to: GeoPoint): number {
  const toRad = (degrees: number) => degrees * (Math.PI / 180)
  const dLat = toRad(to.lat - from.lat)
  const dLng = toRad(to.lng - from.lng)
  const lat1 = toRad(from.lat)
  const lat2 = toRad(to.lat)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function pathDistanceMeters(path: GeoPoint[]): number {
  return path.reduce((total, point, index) => {
    if (index === 0)
      return 0
    return total + haversineMeters(path[index - 1], point)
  }, 0)
}

export function formatDistance(meters: number, locale: string): string {
  if (meters < 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'meter',
      unitDisplay: 'short',
      maximumFractionDigits: 0,
    }).format(Math.round(meters))
  }

  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilometer',
    unitDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(meters / 1000)
}

export function isGeoPoint(value: unknown): value is GeoPoint {
  if (!value || typeof value !== 'object')
    return false

  const point = value as GeoPoint
  return typeof point.lat === 'number'
    && Number.isFinite(point.lat)
    && typeof point.lng === 'number'
    && Number.isFinite(point.lng)
    && typeof point.timestamp === 'number'
}

export function useRouteTracker() {
  const points = ref<GeoPoint[]>([])
  const gpsStatus = ref<GpsStatus>('idle')
  const distanceMeters = computed(() => pathDistanceMeters(points.value))

  let watchId: number | null = null
  let wakeLock: WakeLockSentinel | null = null

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

  function onError(error: GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) {
      gpsStatus.value = 'denied'
      clearWatch()
      return
    }

    gpsStatus.value = navigator.geolocation ? 'error' : 'unavailable'
  }

  async function acquireWakeLock() {
    try {
      wakeLock = await navigator.wakeLock?.request('screen') ?? null
    }
    catch {
      wakeLock = null
    }
  }

  function releaseWakeLock() {
    void wakeLock?.release()
    wakeLock = null
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible' && watchId !== null)
      void acquireWakeLock()
  }

  function clearWatch() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }

    document.removeEventListener('visibilitychange', onVisibilityChange)
    releaseWakeLock()
  }

  function startTracking() {
    if (watchId !== null)
      return

    if (!navigator.geolocation) {
      gpsStatus.value = 'unavailable'
      return
    }

    gpsStatus.value = 'requesting'
    document.addEventListener('visibilitychange', onVisibilityChange)
    void acquireWakeLock()

    watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15_000,
    })
  }

  function stopTracking() {
    clearWatch()

    if (gpsStatus.value === 'requesting' || gpsStatus.value === 'tracking')
      gpsStatus.value = 'idle'
  }

  function resetTracking() {
    stopTracking()
    points.value = []
    gpsStatus.value = 'idle'
  }

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
