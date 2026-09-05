export interface GeoPoint {
  lat: number
  lng: number
  timestamp: number
}

/**
 * Проверяет, что значение является точкой маршрута.
 * @param value - неизвестное значение из хранилища или API
 */
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
