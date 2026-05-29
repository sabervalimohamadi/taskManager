import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { tasksApi } from '@/api/endpoints/tasks'
import type { Task } from '@/types'

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useMutation({
    mutationFn: (dto: Partial<Task>) => tasksApi.create(dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
  return { mutate, isPending, error }
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: Partial<Task> & { expectedVersion: number }
    }) => tasksApi.update(id, dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
  return { mutate, isPending, error }
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
  return { mutate, isPending, error }
}
