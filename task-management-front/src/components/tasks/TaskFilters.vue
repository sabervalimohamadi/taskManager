<script setup lang="ts">
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import type { TaskFilters } from '@/api/endpoints/tasks'

const props = defineProps<{ modelValue: TaskFilters }>()
const emit = defineEmits<{ 'update:modelValue': [value: TaskFilters] }>()

const search = ref(props.modelValue.search ?? '')

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

const priorityOptions = [
  { label: 'All Priorities', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const sortOptions = [
  { label: 'Newest', value: 'createdAt:desc' },
  { label: 'Oldest', value: 'createdAt:asc' },
  { label: 'Deadline', value: 'deadline:asc' },
]

let debounceTimer: ReturnType<typeof setTimeout>

watch(search, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', { ...props.modelValue, search: val, page: 1 })
  }, 400)
})

function onStatusChange(val: string) {
  emit('update:modelValue', { ...props.modelValue, status: val, page: 1 })
}

function onPriorityChange(val: string) {
  emit('update:modelValue', { ...props.modelValue, priority: val, page: 1 })
}

function onSortChange(val: string) {
  const [sortBy, sortOrder] = val.split(':')
  emit('update:modelValue', {
    ...props.modelValue,
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc',
    page: 1,
  })
}

const currentSort = `${props.modelValue.sortBy ?? 'createdAt'}:${props.modelValue.sortOrder ?? 'desc'}`
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3 mb-4">
    <AppInput
      v-model="search"
      placeholder="Search tasks..."
      class="sm:flex-1"
    />
    <AppSelect
      :model-value="modelValue.status ?? ''"
      :options="statusOptions"
      class="sm:w-40"
      @update:model-value="onStatusChange"
    />
    <AppSelect
      :model-value="modelValue.priority ?? ''"
      :options="priorityOptions"
      class="sm:w-40"
      @update:model-value="onPriorityChange"
    />
    <AppSelect
      :model-value="currentSort"
      :options="sortOptions"
      class="sm:w-36"
      @update:model-value="onSortChange"
    />
  </div>
</template>
