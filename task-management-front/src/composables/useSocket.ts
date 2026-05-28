import { ref, onUnmounted } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth.store'

let socket: Socket | null = null

export function useSocket() {
  const isConnected = ref(false)
  const authStore = useAuthStore()

  function connect() {
    if (socket?.connected) return

    socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token: authStore.accessToken },
      autoConnect: true,
    })

    socket.on('connect', () => {
      isConnected.value = true
    })

    socket.on('disconnect', () => {
      isConnected.value = false
    })
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
    isConnected.value = false
  }

  function on<T>(event: string, handler: (data: T) => void) {
    socket?.on(event, handler)
  }

  function off(event: string) {
    socket?.off(event)
  }

  onUnmounted(() => {
    off('connect')
    off('disconnect')
  })

  return { connect, disconnect, on, off, isConnected }
}
