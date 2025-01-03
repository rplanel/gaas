<script setup lang="ts">
import { clearError, useError } from '#imports'

const error = useError()

async function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <NuxtLayout>
    <div v-if="error">
      <UAlert
        color="error"
        variant="soft"
        title="Error"
        :description="error.message"
        icon="i-material-symbols:error"
        :actions="[
          {
            label: 'go to list workfows',
            onClick(event) {
              handleError();
            },
          },
        ]"
      />
    </div>
  </NuxtLayout>
</template>
