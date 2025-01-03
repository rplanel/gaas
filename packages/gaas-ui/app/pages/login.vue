<script setup lang="ts">
import {
  createError,
  navigateTo,
  useRoute,
  useSupabaseClient,
  useSupabaseUser,
} from '#imports'
import { ref, watchEffect } from 'vue'
import { z } from 'zod'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { query } = useRoute()
const showPassword = ref(false)
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
})

watchEffect(async () => {
  if (user.value) {
    await navigateTo(query.redirectTo as string, {
      replace: true,
    })
  }
})
async function handleSignIn() {
  const queryParams
    = query.redirectTo !== undefined ? `?redirectTo=${query.redirectTo}` : ''
  const redirectTo = `/confirm${queryParams}`
  const { email, password } = state
  if (email && password) {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (data?.user) {
      await navigateTo(redirectTo as string, { replace: true })
    }

    if (error) {
      createError('Unable to sign in')
    }
  }
}

async function handleSignUp() {
  // const queryParams
  //   = query.redirectTo !== undefined ? `?redirectTo=${query.redirectTo}` : ''
  const redirectTo = `${window.location.origin}`
  const { email, password } = state
  if (email && password) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    })
    if (error) {
      createError('Unable to sign up')
    }
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-bold">
        Log in to
      </h2>
    </template>
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
    >
      <UFormField
        label="Email address"
        name="email"
        required
      >
        <UInput
          v-model="state.email"
          placeholder="johndoe@gmail.com"
          type="email"
        />
      </UFormField>
      <UFormField
        label="Password"
        name="password"
        help="Enter your password to access this website"
        required
      >
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              aria-label="show ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              aria-controls="password"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        loading-auto
        class="mr-3"
        @click="handleSignIn"
      >
        Sign In
      </UButton>
      <UButton
        variant="subtle"
        @click="handleSignUp"
      >
        Sign Up
      </UButton>
    </UForm>
  </UCard>
</template>
