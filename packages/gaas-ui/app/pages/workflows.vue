<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'

definePageMeta({
  layout: 'dashboard',
})

type Database = SupabaseTypes.Database
const supabase = useSupabaseClient<Database>()
const { userRole } = useUserRole(supabase)

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

        <template v-if="userRole === 'admin'" #right>
          <UButton icon="i-lucide-plus" size="md" class="rounded-full" to="/admin/workflows" />
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
