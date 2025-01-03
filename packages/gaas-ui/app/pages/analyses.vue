<script setup lang="ts">
const breadcrumbsItems = ref([
  {
    // label: 'Home',
    disabled: false,
    icon: 'lucide:house',
    to: '/',
  },
  {
    label: 'Analyses',
    disabled: true,
    to: '/analyses',
  },
])
</script>

<template>
  <div>
    <NuxtPage :breadcrumbs-items="breadcrumbsItems" />
  </div>
</template>
