<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})
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
  <UDashboardPanel id="workflows" title="Workflows">
    <template #header>
      <UDashboardNavbar title="Workflows" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          test
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <UPage>
        <NuxtPage :breadcrumbs-items="breadcrumbsItems" />
      </UPage>
    </template>
  </UDashboardPanel>
</template>
