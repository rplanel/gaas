<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

interface Props {
  title: string
  description?: string | undefined
  breadcrumbsItems?: BreadcrumbItem[] | undefined
  icon?: string | undefined
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Title',
  description: undefined,
  breadcrumbsItems: undefined,
  icon: undefined,

})

const { breadcrumbsItems } = toRefs(props)
</script>

<template>
  <div>
    <div v-if="breadcrumbsItems" class="py-4">
      <UBreadcrumb :items="breadcrumbsItems" />
    </div>
    <UPageHeader :description :title />
  </div>
</template>
