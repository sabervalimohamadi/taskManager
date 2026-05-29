<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type BadgeColor = 'green' | 'yellow' | 'blue' | 'red' | 'gray'

const props = defineProps<{
  color: BadgeColor
  label: string
  class?: string
}>()

const colorMap: Record<BadgeColor, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
}

const classes = computed(() =>
  cn(
    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
    colorMap[props.color],
    props.class,
  ),
)
</script>

<template>
  <span :class="classes">{{ label }}</span>
</template>
