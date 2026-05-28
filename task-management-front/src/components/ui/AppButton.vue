<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import AppSpinner from './AppSpinner.vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    class?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
  },
)

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    {
      'bg-[#a72b77] text-white hover:bg-[#8a2363] focus-visible:ring-[#a72b77]':
        props.variant === 'primary',
      'bg-white text-[#a72b77] border border-[#a72b77] hover:bg-[#fdf4f9]':
        props.variant === 'secondary',
      'text-[#a72b77] hover:bg-[#fdf4f9]': props.variant === 'ghost',
    },
    {
      'h-8 px-3 text-sm': props.size === 'sm',
      'h-10 px-4 text-sm': props.size === 'md',
      'h-12 px-6 text-base': props.size === 'lg',
    },
    props.class,
  ),
)
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="classes">
    <AppSpinner v-if="loading" class="mr-2 h-4 w-4" />
    <slot />
  </button>
</template>
