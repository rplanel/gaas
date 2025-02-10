<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()
</script>

<template>
  <div>
    <UApp>
      <!-- <Banner /> -->
      <AppHeader />
      <UMain>
        <NuxtLayout>
          <UError :error="error" />
        </NuxtLayout>
      </UMain>
      <USeparator type="dashed" class="h-px" />
      <AppFooter />
    </UApp>
  </div>
</template>
