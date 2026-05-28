<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
</script>

<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">
        Hello, {{ authStore.user?.name ?? 'there' }} 👋
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <AppCard class="p-5">
          <p class="text-sm text-gray-500 mb-1">Total Tasks</p>
          <p class="text-3xl font-bold text-[#a72b77]">0</p>
        </AppCard>
        <AppCard class="p-5">
          <p class="text-sm text-gray-500 mb-1">In Progress</p>
          <p class="text-3xl font-bold text-[#a72b77]">0</p>
        </AppCard>
        <AppCard class="p-5">
          <p class="text-sm text-gray-500 mb-1">Done</p>
          <p class="text-3xl font-bold text-[#a72b77]">0</p>
        </AppCard>
      </div>

      <AppCard class="p-6">
        <p class="text-center text-gray-400 py-12">
          No tasks yet — Phase 2 will bring the full task list here.
        </p>
      </AppCard>
    </div>
  </AppLayout>
</template>
