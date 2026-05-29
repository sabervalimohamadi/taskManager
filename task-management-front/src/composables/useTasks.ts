import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { tasksApi, type TaskFilters } from '@/api/endpoints/tasks'
import type { Ref } from 'vue'

export function useTasks(filters: Ref<TaskFilters>) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: computed(() => ['tasks', filters.value]),
    queryFn: () => tasksApi.getAll(filters.value).then((r) => r.data),
    staleTime: 30_000,
  })

  const tasks = computed(() => data.value?.data ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const totalPages = computed(() => data.value?.totalPages ?? 1)

  return { tasks, total, totalPages, isLoading, isError, refetch }
}
