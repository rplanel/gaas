<script setup lang="ts">
import { useState } from '#imports'

const { toaster } = useAppConfig()

// const highlight = ref(true)
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
  ],

  htmlAttrs: {
    lang: 'en',
  },
})
useState('showWorkflowStepParameter', () => true)
</script>

<template>
  <div>
    <UApp :toaster>
      <!-- <Banner /> -->
      <AppHeader />
      <UMain>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UMain>
      <USeparator type="dashed" class="h-px" />
      <AppFooter />
    </UApp>
  </div>
</template>
