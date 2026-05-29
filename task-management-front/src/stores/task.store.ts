import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task } from '@/types'

export const useTaskStore = defineStore('task', () => {
  const selectedTask = ref<Task | null>(null)
  const isCreateModalOpen = ref(false)
  const isEditModalOpen = ref(false)

  function openCreate() {
    selectedTask.value = null
    isCreateModalOpen.value = true
    isEditModalOpen.value = false
  }

  function openEdit(task: Task) {
    selectedTask.value = task
    isEditModalOpen.value = true
    isCreateModalOpen.value = false
  }

  function closeModals() {
    isCreateModalOpen.value = false
    isEditModalOpen.value = false
    selectedTask.value = null
  }

  return { selectedTask, isCreateModalOpen, isEditModalOpen, openCreate, openEdit, closeModals }
})
