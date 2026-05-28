<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useAuth } from '@/composables/useAuth'

const schema = toTypedSchema(
  z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
)

const { handleSubmit, errors } = useForm({ validationSchema: schema })
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const { login, error, isLoading } = useAuth()

const onSubmit = handleSubmit(async (values) => {
  await login(values)
})
</script>

<template>
  <AuthLayout>
    <AppCard class="w-full max-w-md p-8">
      <div class="mb-8 text-center">
        <h2 class="text-2xl font-bold text-gray-800">Welcome back</h2>
        <p class="mt-1 text-sm text-gray-500">Sign in to your account</p>
      </div>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-5">
        <AppInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          :error="errors.email"
        />

        <AppInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
        />

        <p v-if="error" class="text-sm text-red-500 text-center">{{ error }}</p>

        <AppButton type="submit" :loading="isLoading" size="lg" class="w-full mt-2">
          Sign in
        </AppButton>
      </form>
    </AppCard>
  </AuthLayout>
</template>
