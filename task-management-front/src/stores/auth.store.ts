import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<User | null>(null)
    const accessToken = ref<string | null>(null)

    function setAuth(newUser: User, token: string) {
      user.value = newUser
      accessToken.value = token
    }

    function setToken(token: string) {
      accessToken.value = token
    }

    function logout() {
      user.value = null
      accessToken.value = null
    }

    return { user, accessToken, setAuth, setToken, logout }
  },
  {
    persist: {
      key: 'auth',
      storage: localStorage,
    },
  },
)
