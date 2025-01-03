<script setup lang="ts">
const breadcrumbsItems = ref([
  {
    disabled: false,
    icon: 'lucide:house',
    to: '/',
  },
  {
    label: 'Workflows',
    disabled: true,
    to: '/workflows',
  },
])
</script>

<template>
  <div>
    <NuxtPage :breadcrumbs-items="breadcrumbsItems" />
  </div>
</template>
