<script setup lang="ts">
import { computed } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import type { TaskStatus } from '@/types'

const props = defineProps<{ status: TaskStatus }>()

const colorMap = { todo: 'gray', in_progress: 'blue', done: 'green' } as const
const labelMap = { todo: 'Todo', in_progress: 'In Progress', done: 'Done' } as const

const color = computed(() => colorMap[props.status])
const label = computed(() => labelMap[props.status])
</script>

<template>
  <AppBadge :color="color" :label="label" />
</template>
