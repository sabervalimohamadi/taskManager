<script setup lang="ts">
import { computed, ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useUpdateTask } from '@/composables/useTaskMutations'
import { useTaskStore } from '@/stores/task.store'
import type { Task } from '@/types'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ close: [] }>()

const taskStore = useTaskStore()
const { mutate, isPending, error } = useUpdateTask()
const conflictError = ref(false)

const schema = toTypedSchema(
  z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'done']),
    priority: z.enum(['low', 'medium', 'high']),
    deadline: z.string().optional(),
  }),
)

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
  initialValues: {
    title: props.task.title,
    description: props.task.description ?? '',
    status: props.task.status,
    priority: props.task.priority,
    deadline: props.task.deadline
      ? new Date(props.task.deadline).toISOString().split('T')[0]
      : '',
  },
})

const { value: title } = useField<string>('title')
const { value: description } = useField<string>('description')
const { value: status } = useField<string>('status')
const { value: priority } = useField<string>('priority')
const { value: deadline } = useField<string>('deadline')

const statusOptions = [
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const errorMessage = computed(() => {
  if (conflictError.value) return null
  if (!error.value) return null
  const err = error.value as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message ?? 'Failed to update task'
})

const onSubmit = handleSubmit((values) => {
  conflictError.value = false
  mutate(
    {
      id: props.task._id,
      dto: {
        ...values,
        deadline: values.deadline || undefined,
        expectedVersion: props.task.version,
      },
    },
    {
      onSuccess: () => {
        taskStore.closeModals()
      },
      onError: (err: unknown) => {
        const axiosErr = err as { response?: { status?: number } }
        if (axiosErr?.response?.status === 409) {
          conflictError.value = true
        }
      },
    },
  )
})
</script>

<template>
  <AppModal :open="true" title="Edit Task" @close="emit('close')">
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
      <AppInput
        v-model="title"
        label="Title *"
        placeholder="Task title"
        :error="errors.title"
      />

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Description</label>
        <textarea
          v-model="description"
          placeholder="Optional description..."
          rows="3"
          class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a72b77] focus:border-transparent resize-none"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Status</label>
          <AppSelect v-model="status" :options="statusOptions" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Priority</label>
          <AppSelect v-model="priority" :options="priorityOptions" />
        </div>
      </div>

      <AppInput
        v-model="deadline"
        label="Deadline"
        type="date"
        :error="errors.deadline"
      />

      <div
        v-if="conflictError"
        class="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800"
      >
        This task was modified by someone else. Please close and refresh to see the latest version.
      </div>

      <p v-else-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

      <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <AppButton variant="ghost" type="button" @click="emit('close')">Cancel</AppButton>
        <AppButton type="submit" :loading="isPending" :disabled="conflictError">
          Save Changes
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
