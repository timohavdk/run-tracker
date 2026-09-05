<script setup lang="ts">
import type { GeoPoint } from '../../types/geo'
import { useTemplateRef } from 'vue'
import BaseText from '../base/typography/base-text/base-text.vue'
import styles from './run-map.module.scss'
import { useRunMap } from './use-run-map'

const props = withDefaults(defineProps<{
  path: GeoPoint[]
  follow?: boolean
  emptyLabel: string
}>(), {
  follow: false,
})

const container = useTemplateRef<HTMLDivElement>('container')
useRunMap(container, () => props.path, () => props.follow)
</script>

<template>
  <div :class="styles.root">
    <base-text v-if="path.length === 0" size="sm" :class="styles.placeholder">
      {{ emptyLabel }}
    </base-text>
    <div ref="container" :class="styles.map" />
  </div>
</template>
