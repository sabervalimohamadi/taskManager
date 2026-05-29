<script setup lang="ts">
import { computed } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import type { TaskPriority } from '@/types'

const props = defineProps<{ priority: TaskPriority }>()

const colorMap = { low: 'green', medium: 'yellow', high: 'red' } as const
const labelMap = { low: 'Low', medium: 'Medium', high: 'High' } as const

const color = computed(() => colorMap[props.priority])
const label = computed(() => labelMap[props.priority])
</script>

<template>
  <AppBadge :color="color" :label="label" />
</template>
