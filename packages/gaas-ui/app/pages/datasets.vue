<script setup lang="ts">
import type { BreadcrumbItem } from '#ui/types'

const breadcrumbsItems = ref<BreadcrumbItem[]>([
  {
    icon: 'lucide:house',
    disabled: false,
    to: '/',
  },
  {
    label: 'Datasets',
    disabled: true,
    to: '/datasets',
  },
])
</script>

<template>
  <div>
    <NuxtPage :breadcrumbs-items="breadcrumbsItems" />
  </div>
</template>
