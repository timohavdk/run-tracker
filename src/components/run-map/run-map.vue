<script setup lang="ts">
import type { GeoPoint } from '../../composables/use-route-tracker'
import L from 'leaflet'
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import styles from './run-map.module.scss'
import 'leaflet/dist/leaflet.css'

const props = withDefaults(defineProps<{
  path: GeoPoint[]
  follow?: boolean
  emptyLabel: string
}>(), {
  follow: false,
})

const container = useTemplateRef<HTMLDivElement>('container')

let map: L.Map | null = null
let polyline: L.Polyline | null = null
let marker: L.CircleMarker | null = null

function latLngs(path: GeoPoint[]): L.LatLngExpression[] {
  return path.map(point => [point.lat, point.lng])
}

function clearLayers() {
  polyline?.remove()
  marker?.remove()
  polyline = null
  marker = null
}

function updateLayer() {
  if (!map)
    return

  const coords = latLngs(props.path)
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

  if (props.follow) {
    map.setView(last, Math.max(map.getZoom(), 16))
    return
  }

  if (coords.length === 1) {
    map.setView(last, 16)
    return
  }

  map.fitBounds(polyline.getBounds(), { padding: [16, 16] })
}

onMounted(() => {
  if (!container.value)
    return

  map = L.map(container.value, {
    zoomControl: false,
    attributionControl: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    className: 'run-map-tiles',
  }).addTo(map)

  map.setView([0, 0], 2)
  updateLayer()
  requestAnimationFrame(() => map?.invalidateSize())
})

watch(() => props.path, () => {
  updateLayer()
  requestAnimationFrame(() => map?.invalidateSize())
}, { deep: true })

onUnmounted(() => {
  clearLayers()
  map?.remove()
  map = null
})
</script>

<template>
  <div :class="styles.root">
    <p v-if="path.length === 0" :class="styles.placeholder">
      {{ emptyLabel }}
    </p>
    <div ref="container" :class="styles.map" />
  </div>
</template>
