import client from '@/api/client'
import type { Task, PaginatedResponse } from '@/types'

export interface TaskFilters {
  page?: number
  limit?: number
  status?: string
  priority?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const tasksApi = {
  getAll: (filters: TaskFilters) =>
    client.get<PaginatedResponse<Task>>('/tasks', { params: filters }),

  getOne: (id: string) =>
    client.get<Task>(`/tasks/${id}`),

  create: (dto: Partial<Task>) =>
    client.post<Task>('/tasks', dto),

  update: (id: string, dto: Partial<Task> & { expectedVersion: number }) =>
    client.patch<Task>(`/tasks/${id}`, dto),

  remove: (id: string) =>
    client.delete(`/tasks/${id}`),
}
