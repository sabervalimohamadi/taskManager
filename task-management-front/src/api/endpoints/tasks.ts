import apiClient from '@/api/client'
import type { Task } from '@/types'

export interface CreateTaskDto {
  title: string
  description?: string
  priority?: Task['priority']
  dueDate?: string
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: Task['status']
}

export const tasksApi = {
  getAll: () => apiClient.get<Task[]>('/tasks'),
  getOne: (id: string) => apiClient.get<Task>(`/tasks/${id}`),
  create: (dto: CreateTaskDto) => apiClient.post<Task>('/tasks', dto),
  update: (id: string, dto: UpdateTaskDto) => apiClient.patch<Task>(`/tasks/${id}`, dto),
  remove: (id: string) => apiClient.delete(`/tasks/${id}`),
}
