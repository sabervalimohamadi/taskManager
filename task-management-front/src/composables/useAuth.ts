import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/endpoints/auth'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginCredentials } from '@/types'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  async function login(credentials: LoginCredentials) {
    error.value = null
    isLoading.value = true
    try {
      const { data } = await authApi.login(credentials)
      authStore.setAuth(data.user, data.accessToken)
      await router.push('/dashboard')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        error.value = axiosErr.response?.data?.message ?? 'Login failed'
      } else {
        error.value = 'Login failed'
      }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore, still clear local state
    } finally {
      authStore.logout()
      await router.push('/login')
    }
  }

  return { login, logout, error, isLoading }
}
