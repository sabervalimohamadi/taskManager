<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import AppCard from '@/components/ui/AppCard.vue'
import TaskStatusBadge from './TaskStatusBadge.vue'
import TaskPriorityBadge from './TaskPriorityBadge.vue'
import { useTaskStore } from '@/stores/task.store'
import { useDeleteTask } from '@/composables/useTaskMutations'
import type { Task } from '@/types'

const props = defineProps<{ task: Task }>()

const taskStore = useTaskStore()
const { mutate: deleteTask } = useDeleteTask()

function formatDeadline(date: string | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isPastDue(date: string | undefined): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

function confirmDelete() {
  if (window.confirm(`Delete "${props.task.title}"? This cannot be undone.`)) {
    deleteTask(props.task._id)
  }
}
</script>

<template>
  <AppCard class="p-4">
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-medium text-gray-800 leading-snug">{{ task.title }}</h3>
      <div class="flex gap-1 shrink-0">
        <button
          class="p-1.5 text-gray-400 hover:text-[#a72b77] hover:bg-[#fdf4f9] rounded-lg transition-colors"
          @click="taskStore.openEdit(task)"
        >
          <Pencil class="w-4 h-4" />
        </button>
        <button
          class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          @click="confirmDelete"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mt-2">
      <TaskStatusBadge :status="task.status" />
      <TaskPriorityBadge :priority="task.priority" />
    </div>

    <div v-if="task.deadline" class="mt-2 text-xs" :class="isPastDue(task.deadline) && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-gray-400'">
      Due {{ formatDeadline(task.deadline) }}
    </div>

    <div v-if="task.assignedTo" class="mt-1 text-xs text-gray-400">
      {{ task.assignedTo.email }}
    </div>
  </AppCard>
</template>
