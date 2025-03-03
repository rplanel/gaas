<script setup lang="ts">
import { useState } from '#imports'

const appConfig = useAppConfig()

// const highlight = ref(true)
useHead({
  meta: [
    { charset: 'utf-8' },

    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
  ],

  htmlAttrs: {
    lang: 'en',
  },
})

useSeoMeta({
  ...appConfig?.gaasUi.seo,
})

// const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('content'))
// const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('content'), { server: false,
// })
useState('showWorkflowStepParameter', () => true)
</script>

<template>
  <div>
    <UApp>
      <!-- <Banner /> -->
      <NuxtLoadingIndicator />
      <UMain>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UMain>

      <!--      <template v-if="files && navigation">
        <ClientOnly>
          <LazyUContentSearch :files="files" :navigation="navigation" />
        </ClientOnly>
      </template>
-->
    </UApp>
  </div>
</template>
