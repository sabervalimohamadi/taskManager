<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import TaskStatusBadge from './TaskStatusBadge.vue'
import TaskPriorityBadge from './TaskPriorityBadge.vue'
import { useTaskStore } from '@/stores/task.store'
import { useDeleteTask } from '@/composables/useTaskMutations'
import type { Task } from '@/types'

defineProps<{ tasks: Task[]; isLoading: boolean }>()

const taskStore = useTaskStore()
const { mutate: deleteTask } = useDeleteTask()

function formatDeadline(date: string | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isPastDue(date: string | undefined): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

function confirmDelete(task: Task) {
  if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
    deleteTask(task._id)
  }
}
</script>

<template>
  <div class="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
    <table class="min-w-full text-sm">
      <thead class="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
        <tr>
          <th class="px-4 py-3 text-left font-medium">Title</th>
          <th class="px-4 py-3 text-left font-medium">Status</th>
          <th class="px-4 py-3 text-left font-medium">Priority</th>
          <th class="px-4 py-3 text-left font-medium">Assigned To</th>
          <th class="px-4 py-3 text-left font-medium">Deadline</th>
          <th class="px-4 py-3 text-right font-medium">Actions</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-100">
        <!-- Skeleton rows -->
        <template v-if="isLoading">
          <tr v-for="i in 5" :key="i" class="animate-pulse">
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-48" /></td>
            <td class="px-4 py-3"><div class="h-5 bg-gray-200 rounded-full w-20" /></td>
            <td class="px-4 py-3"><div class="h-5 bg-gray-200 rounded-full w-16" /></td>
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-28" /></td>
            <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-24" /></td>
            <td class="px-4 py-3"><div class="h-6 bg-gray-200 rounded w-16 ml-auto" /></td>
          </tr>
        </template>

        <!-- Empty state -->
        <tr v-else-if="tasks.length === 0">
          <td colspan="6" class="px-4 py-16 text-center text-gray-400">
            <p class="text-lg font-medium mb-1">No tasks found</p>
            <p class="text-sm">Try adjusting your filters or create a new task.</p>
          </td>
        </tr>

        <!-- Data rows -->
        <tr
          v-else
          v-for="task in tasks"
          :key="task._id"
          class="hover:bg-gray-50 transition-colors"
        >
          <td class="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">
            {{ task.title }}
          </td>
          <td class="px-4 py-3">
            <TaskStatusBadge :status="task.status" />
          </td>
          <td class="px-4 py-3">
            <TaskPriorityBadge :priority="task.priority" />
          </td>
          <td class="px-4 py-3 text-gray-500">
            {{ task.assignedTo?.email ?? '—' }}
          </td>
          <td class="px-4 py-3" :class="isPastDue(task.deadline) && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-gray-500'">
            {{ formatDeadline(task.deadline) }}
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-end gap-2">
              <button
                class="p-1.5 text-gray-400 hover:text-[#a72b77] hover:bg-[#fdf4f9] rounded-lg transition-colors"
                title="Edit"
                @click="taskStore.openEdit(task)"
              >
                <Pencil class="w-4 h-4" />
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
                @click="confirmDelete(task)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
