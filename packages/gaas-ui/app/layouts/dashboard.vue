<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { OrderedNavigationMenuItem } from '../app.config'

const { gaasUi: { navigationMenuItems, footerItems } } = useAppConfig()
const navigationMenuItemsRef: Ref<OrderedNavigationMenuItem[]> = toRef(navigationMenuItems)
const footerItemsRef: Ref<NavigationMenuItem[]> = toRef(footerItems)
const supabase = useSupabaseClient()
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

const computedLinks = computed<OrderedNavigationMenuItem[][]>(() => {
  const itemsVal = toValue(navigationMenuItemsRef)
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
</script>

<template>
  <UDashboardGroup>
    <!-- <UDashboardSearch :groups="groups" /> -->

    <UDashboardSidebar
      collapsible resizable class="bg-(--ui-bg-elevated)/25"
      :ui="{ footer: 'lg:border-t lg:border-(--ui-border)' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <!-- <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-(--ui-border)" /> -->

        <UNavigationMenu :collapsed="collapsed" :items="computedLinks[0]" orientation="vertical" />

        <UNavigationMenu :collapsed="collapsed" :items="computedLinks[1]" orientation="vertical" class="mt-auto" />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" :is-admin="isAdmin" />
      </template>
    </UDashboardSidebar>

    <slot />

    <HelpSlideover />
    <NotificationsSlideover />
  </UDashboardGroup>
</template>
