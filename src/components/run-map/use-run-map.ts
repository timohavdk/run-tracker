import type { MaybeRefOrGetter } from 'vue'
import type { GeoPoint } from '../../types/geo'
import L from 'leaflet'
import { onMounted, onUnmounted, toValue, watch } from 'vue'
import 'leaflet/dist/leaflet.css'

/**
 * Преобразует точки маршрута в координаты Leaflet.
 * @param points - точки с широтой и долготой
 */
function latLngs(points: GeoPoint[]): L.LatLngExpression[] {
  return points.map(point => [point.lat, point.lng])
}

/**
 * Рисует маршрут на карте и обновляет его при изменении точек.
 * @param container - DOM-элемент или ref контейнера карты
 * @param path - точки маршрута или getter/ref с ними
 * @param follow - следить ли камерой за последней точкой
 */
export function useRunMap(
  container: MaybeRefOrGetter<HTMLDivElement | null>,
  path: MaybeRefOrGetter<GeoPoint[]>,
  follow: MaybeRefOrGetter<boolean> = false,
) {
  let map: L.Map | null = null
  let polyline: L.Polyline | null = null
  let marker: L.CircleMarker | null = null

  /** Удаляет линию и маркер с карты. */
  function clearLayers() {
    polyline?.remove()
    marker?.remove()
    polyline = null
    marker = null
  }

  /** Обновляет линию, маркер и область просмотра по текущему маршруту. */
  function updateLayer() {
    if (!map)
      return

    const coords = latLngs(toValue(path))
    if (coords.length === 0) {
      clearLayers()
      return
    }

    if (polyline) {
      polyline.setLatLngs(coords)
    }
    else {
      polyline = L.polyline(coords, {
        color: '#22c55e',
        weight: 4,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(map)
    }

    const last = coords.at(-1)
    if (!last)
      return

    if (marker) {
      marker.setLatLng(last)
    }
    else {
      marker = L.circleMarker(last, {
        radius: 6,
        color: '#16a34a',
        fillColor: '#22c55e',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map)
    }

    if (toValue(follow)) {
      map.setView(last, Math.max(map.getZoom(), 16))
      return
    }

    if (coords.length === 1) {
      map.setView(last, 16)
      return
    }

    map.fitBounds(polyline.getBounds(), { padding: [16, 16] })
  }

  /** Пересчитывает размер карты после отрисовки. */
  function invalidate() {
    requestAnimationFrame(() => map?.invalidateSize())
  }

  onMounted(() => {
    const el = toValue(container)
    if (!el)
      return

    map = L.map(el, {
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'run-map-tiles',
    }).addTo(map)

    map.setView([0, 0], 2)
    updateLayer()
    invalidate()
  })

  watch(() => toValue(path), () => {
    updateLayer()
    invalidate()
  }, { deep: true })

  onUnmounted(() => {
    clearLayers()
    map?.remove()
    map = null
  })
}
