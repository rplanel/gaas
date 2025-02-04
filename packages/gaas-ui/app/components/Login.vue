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

function throwError() {
  throw createError({ statusMessage: 'throw error from component', statusCode: 400 })
}

async function handleSignIn() {
  // throw createError({ statusMessage: 'throw error from component' })

  const queryParams
    = query.redirectTo !== undefined ? `?redirectTo=${query.redirectTo}` : ''
  query.redirectTo = queryParams
  const { email, password } = state
  if (email && password) {
    // try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw createError({
        statusMessage: `${getErrorMessage(error)}`,
        statusCode: getStatusCode(error),
      })
    }
  }
  else {
    throw createError('Email and password are required')
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
      throw createError('Unable to sign up')
    }
  }
}

// if (errorComponent.value) {
//   throw createError({
//     statusMessage: `${getErrorMessage(errorComponent.value)} dans body setup`,
//     statusCode: getStatusCode(errorComponent.value),
//   })
// }

watchEffect(async () => {
  if (user.value) {
    await navigateTo(query.redirectTo as string, {
      replace: true,
    })
  }
})

// watchEffect(() => {
//   if (errorComponent.value) {
//     throw createError({
//       statusMessage: `${getErrorMessage(errorComponent.value)} dans body setup`,
//       statusCode: getStatusCode(errorComponent.value),
//     })
//   }
// })
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <h2 class="text-lg font-bold">
          Log in to
        </h2>
      </template>
      <!-- <NuxtErrorBoundary> -->
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
          class="mr-3"
          @click="throwError"
        >
          Sign In
        </UButton>
        <button @click="handleSignIn">
          Sign In
        </button>
        <UButton
          loading-auto
          variant="subtle"
          @click="handleSignUp"
        >
          Sign Up
        </UButton>
        <!-- <UAlert v-if="errorComponent" title="rerererere" :description="errorComponent.message">
          {{ errorComponent.message }}
        </UAlert> -->
      </UForm>
      <!-- <template #error="{ error, clearError }">
          You can display the error locally here: {{ error }}
          <button @click="clearError">
            This will clear the error.
          </button>
        </template>
      </NuxtErrorBoundary> -->
    </UCard>
  </div>
</template>
