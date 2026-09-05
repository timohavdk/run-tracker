<script setup lang="ts">
import styles from './base-button.module.scss'

withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'chip'
  type?: 'button' | 'submit' | 'reset'
  active?: boolean
}>(), {
  variant: 'primary',
  type: 'button',
  active: false,
})
</script>

<template>
  <button
    :type="type"
    :class="[styles.root, styles[variant], active && styles.active]"
  >
    <slot />
  </button>
</template>
