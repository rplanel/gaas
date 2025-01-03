<script setup lang="ts">
const breadcrumbsItems = ref([
  {
    icon: 'lucide:house',
    disabled: false,
    to: '/',
  },
  {
    label: 'Admin',
    disabled: true,
    to: '/admin',
  },
])
</script>

<template>
  <div>
    <NuxtPage :breadcrumbs-items />
  </div>
</template>
