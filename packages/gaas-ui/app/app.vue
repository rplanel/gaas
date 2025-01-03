<script setup lang="ts">
import type { OrderedNavigationMenuItem } from './app.config'
import { useState, useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()
const { userRole } = useUserRole(supabase)

const { navigationMenuItems, toaster } = useAppConfig()
const items = ref<OrderedNavigationMenuItem[]>(navigationMenuItems)

const computedItems = computed<OrderedNavigationMenuItem[]>(() => {
  const userRoleVal = toValue(userRole)
  const itemsVal = toValue(items)
  if (userRoleVal === 'admin') {
    return [
      ...itemsVal,
      {
        label: 'Admin',
        icon: 'i-material-symbols:admin-panel-settings',
        to: '/admin',
        order: itemsVal.length + 1,
        children: [
          {
            icon: 'i-lucide:workflow',
            label: 'Workflows',
            description: 'Manage workflows',
            to: '/admin/workflows',
          },
          {
            label: 'User',
            icon: 'i-lucide:user',
            description: 'Manage users and roles',
            to: '/admin/users',
          },
        ],
      },

    ].sort((a, b) => a.order - b.order)
  }
  return itemsVal
})
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
  <UApp :toaster>
    <!-- <Banner /> -->
    <AppHeader :links="computedItems" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
