<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import TaskFilters from '@/components/tasks/TaskFilters.vue'
import TaskTable from '@/components/tasks/TaskTable.vue'
import TaskCard from '@/components/tasks/TaskCard.vue'
import TaskPagination from '@/components/tasks/TaskPagination.vue'
import TaskCreateModal from '@/components/tasks/TaskCreateModal.vue'
import TaskEditModal from '@/components/tasks/TaskEditModal.vue'
import { useTasks } from '@/composables/useTasks'
import { useTaskStore } from '@/stores/task.store'
import type { TaskFilters as TFilters } from '@/api/endpoints/tasks'

const taskStore = useTaskStore()

const filters = ref<TFilters>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  status: '',
  priority: '',
  search: '',
})

const { tasks, total, totalPages, isLoading } = useTasks(filters)

const isMobile = ref(window.innerWidth < 768)
function onResize() { isMobile.value = window.innerWidth < 768 }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const statsTodo = computed(() => tasks.value.filter((t) => t.status === 'todo').length)
const statsInProgress = computed(() => tasks.value.filter((t) => t.status === 'in_progress').length)
const statsDone = computed(() => tasks.value.filter((t) => t.status === 'done').length)

function setPage(page: number) {
  filters.value = { ...filters.value, page }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Tasks</h1>
        <AppButton @click="taskStore.openCreate()">+ New Task</AppButton>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <AppCard class="p-4 border-l-4 border-l-[#a72b77]">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total</p>
          <p class="text-2xl font-bold text-gray-800">{{ total }}</p>
        </AppCard>
        <AppCard class="p-4 border-l-4 border-l-gray-400">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Todo</p>
          <p class="text-2xl font-bold text-gray-800">{{ statsTodo }}</p>
        </AppCard>
        <AppCard class="p-4 border-l-4 border-l-blue-400">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">In Progress</p>
          <p class="text-2xl font-bold text-gray-800">{{ statsInProgress }}</p>
        </AppCard>
        <AppCard class="p-4 border-l-4 border-l-green-400">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Done</p>
          <p class="text-2xl font-bold text-gray-800">{{ statsDone }}</p>
        </AppCard>
      </div>

      <!-- Filters -->
      <TaskFilters v-model="filters" />

      <!-- Table (desktop) -->
      <TaskTable v-if="!isMobile" :tasks="tasks" :is-loading="isLoading" />

      <!-- Cards (mobile) -->
      <div v-else class="flex flex-col gap-3">
        <template v-if="isLoading">
          <AppCard v-for="i in 5" :key="i" class="p-4 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-3" />
            <div class="flex gap-2">
              <div class="h-5 bg-gray-200 rounded-full w-20" />
              <div class="h-5 bg-gray-200 rounded-full w-16" />
            </div>
          </AppCard>
        </template>
        <template v-else-if="tasks.length === 0">
          <AppCard class="p-8 text-center text-gray-400">
            <p class="font-medium mb-1">No tasks found</p>
            <p class="text-sm">Adjust filters or create a new task.</p>
          </AppCard>
        </template>
        <TaskCard v-else v-for="task in tasks" :key="task._id" :task="task" />
      </div>

      <!-- Pagination -->
      <TaskPagination
        :page="filters.page ?? 1"
        :total-pages="totalPages"
        :total="total"
        :limit="filters.limit ?? 10"
        @update:page="setPage"
      />

      <!-- Modals -->
      <TaskCreateModal
        v-if="taskStore.isCreateModalOpen"
        @close="taskStore.closeModals()"
      />
      <TaskEditModal
        v-if="taskStore.isEditModalOpen && taskStore.selectedTask"
        :task="taskStore.selectedTask"
        @close="taskStore.closeModals()"
      />
    </div>
  </AppLayout>
</template>
