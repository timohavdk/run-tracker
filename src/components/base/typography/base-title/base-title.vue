<script setup lang="ts">
import styles from './base-title.module.scss'

withDefaults(defineProps<{
  as?: 'h1' | 'h2' | 'h3'
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'muted'
}>(), {
  as: 'h2',
  size: 'md',
  color: 'default',
})
</script>

<template>
  <component
    :is="as"
    :class="[styles.root, styles[`size-${size}`], styles[`color-${color}`]]"
  >
    <slot />
  </component>
</template>
