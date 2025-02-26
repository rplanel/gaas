<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'

import type { CommandPaletteGroup, CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'
import type { OrderedNavigationMenuItem } from '../app.config'
import { useAsyncData } from 'nuxt/app'

type Database = SupabaseTypes.Database

const { gaasUi: { navigationMenuItems, footerItems, name } } = useAppConfig()
const navigationMenuItemsRef: Ref<OrderedNavigationMenuItem[]> = toRef(navigationMenuItems)
const footerItemsRef: Ref<NavigationMenuItem[]> = toRef(footerItems)
const supabase = useSupabaseClient<Database>()
const { userRole } = useUserRole(supabase)

const links: OrderedNavigationMenuItem[] = [{
  label: 'Home',
  icon: 'i-lucide-house',
  to: '/',
  order: 0,

}]

const isAdmin = computed(() => {
  return userRole.value === 'admin'
})

const { data: analyses } = await useAsyncData('search-analyses', async () => {
  const { data } = await supabase
    .schema('galaxy')
    .from('analyses')
    .select('id, name')

  return data
})

const { data: datasetsCount, refresh: refreshDatasetsCount } = await useAsyncData('datasets-count', async () => {
  const { count } = await supabase
    .schema('galaxy')
    .from('uploaded_datasets')
    .select('*', { count: 'exact', head: true })

  return count
})

const sanitizedNavigationMenuItems = computed<OrderedNavigationMenuItem[]>(() => {
  const analysesVal = toValue(analyses)
  const navigationMenuItemsVal = toValue(navigationMenuItemsRef)
  if (!analysesVal)
    return navigationMenuItemsVal

  return navigationMenuItemsVal.map((item) => {
    if (item.label === 'Analyses') {
      return {
        ...item,
        defaultOpen: true,
        badge: analysesVal.length,
        children: analysesVal.map(({ name, id }) => {
          return { label: name, to: `/analyses/${id}/results` }
        }),
      }
    }
    if (item.label === 'Datasets') {
      return {
        ...item,
        badge: datasetsCount.value,
      }
    }
    return item
  })
})
const computedLinks = computed<OrderedNavigationMenuItem[][]>(() => {
  const itemsVal = toValue(sanitizedNavigationMenuItems)
  itemsVal.sort((a, b) => a.order - b.order)
  if (isAdmin.value) {
    return [
      [
        ...links,
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

      ].sort((a, b) => a.order - b.order),
      [...footerItemsRef.value],
    ]
  }
  return [itemsVal]
})

const analysesSearchGroups = computed<CommandPaletteGroup<CommandPaletteItem>>(() => {
  const analysesVal = toValue(analyses)
  return {
    id: 'analyses',
    label: 'Analyses',
    items: analysesVal?.map(({ name, id }) => {
      return { label: name, to: `/analyses/${id}/results` }
    }) ?? [],
  }
})

const searchGroups = computed(() => {
  return [analysesSearchGroups.value]
})

provide('datasetsCount', {
  datasetsCount,
  refreshDatasetsCount,
})
</script>

<template>
  <UDashboardGroup>
    <UDashboardSearch :groups="searchGroups" />
    <UDashboardSidebar
      collapsible resizable class="bg-(--ui-bg-elevated)/25"
      :ui="{ footer: 'lg:border-t lg:border-(--ui-border)' }"
    >
      <template #header="{ collapsed }">
        <span v-if="!collapsed"> {{ name }}</span>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-(--ui-border)" />

        <UNavigationMenu :collapsed="collapsed" :items="computedLinks[0]" orientation="vertical" />

        <UNavigationMenu :collapsed="collapsed" :items="computedLinks[1]" orientation="vertical" class="mt-auto" />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" :is-admin="isAdmin" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
