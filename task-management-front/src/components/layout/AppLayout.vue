<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '@/composables/useAuth'
import AppButton from '@/components/ui/AppButton.vue'

const authStore = useAuthStore()
const { logout } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-[#a72b77] py-3 px-6 shadow-md flex items-center justify-between">
      <h1 class="text-white text-lg font-bold tracking-wide">Task Management</h1>
      <div class="flex items-center gap-3">
        <span class="text-white/80 text-sm">{{ authStore.user?.name }}</span>
        <AppButton variant="secondary" size="sm" @click="logout">Logout</AppButton>
      </div>
    </header>

    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
