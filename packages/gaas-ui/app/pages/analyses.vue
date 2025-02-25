<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})
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
  <UDashboardPanel id="analyses" title="Analyses">
    <template #header>
      <UDashboardNavbar title="Analyses" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" size="md" class="rounded-full" to="/workflows" />
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
