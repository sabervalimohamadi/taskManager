<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-[#fdf4f9] flex flex-col">
    <header class="bg-[#a72b77] py-4 px-6 shadow-md">
      <h1 class="text-white text-xl font-bold tracking-wide">Task Management</h1>
    </header>

    <main class="flex-1 flex items-center justify-center p-4">
      <slot />
    </main>
  </div>
</template>
