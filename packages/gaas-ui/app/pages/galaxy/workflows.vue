<script setup lang="ts">
import { useRouter } from '#imports'

const router = useRouter()
async function resetError(error: Ref<unknown>) {
  error.value = null

  await router.push('/galaxy/workflows')
}
</script>

<template>
  <div>
    <NuxtErrorBoundary>
      <NuxtPage />
      <template #error="{ error }">
        <UAlert
          color="error"
          variant="soft"
          title="Error"
          :description="error"
          icon="i-material-symbols:error"
          :actions="[
            {
              label: 'go to list workfows',
              onClick(event) {
                resetError(error);
              },
            },
          ]"
        />
      </template>
    </NuxtErrorBoundary>
  </div>
</template>
