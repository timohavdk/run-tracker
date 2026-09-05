<script setup lang="ts">
import styles from './base-text.module.scss'

withDefaults(defineProps<{
  as?: 'p' | 'span'
  size?: 'xs' | 'sm' | 'md' | 'xl' | 'display'
  color?: 'default' | 'muted'
}>(), {
  as: 'p',
  size: 'md',
  color: 'muted',
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
