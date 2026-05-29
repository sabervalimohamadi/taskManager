<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
  total: number
  limit: number
}>()

const emit = defineEmits<{ 'update:page': [page: number] }>()

const from = computed(() => (props.page - 1) * props.limit + 1)
const to = computed(() => Math.min(props.page * props.limit, props.total))
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-600">
    <span v-if="total > 0">
      Showing {{ from }}–{{ to }} of {{ total }} tasks
    </span>
    <span v-else>No tasks</span>

    <div class="flex items-center gap-2">
      <button
        class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        ← Previous
      </button>

      <span class="px-3 py-1.5 rounded-lg bg-[#a72b77] text-white font-medium min-w-[2.5rem] text-center">
        {{ page }}
      </span>

      <button
        class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        Next →
      </button>
    </div>
  </div>
</template>
