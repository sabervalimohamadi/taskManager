import apiClient from '@/api/client'
import type { AuthResponse, LoginCredentials } from '@/types'

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  logout: () => apiClient.post('/auth/logout'),

  refresh: () => apiClient.post<{ accessToken: string }>('/auth/refresh'),
}
