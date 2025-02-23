<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { OrderedNavigationMenuItem } from '../app.config'
import { getErrorMessage, getStatusCode } from 'blendtype'

const supabase = useSupabaseClient()
const { userRole } = useUserRole(supabase)

const { gaasUi: { navigationMenuItems } } = useAppConfig()

async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw createError({ statusMessage: getErrorMessage(error), statusCode: getStatusCode(error) })
  }

  await navigateTo('/login')
}

const navigationMenuItemsRef = toRef(navigationMenuItems)

const computedItems = computed<OrderedNavigationMenuItem[]>(() => {
  const userRoleVal = toValue(userRole)
  const itemsVal = toValue(navigationMenuItemsRef)

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
  return itemsVal.sort((a, b) => a.order - b.order)
})

const userItems = ref<DropdownMenuItem[]>([
  {
    label: 'Logout',
    type: 'link',
    icon: 'tabler:logout',
    onSelect: logout,
  },
])
</script>

<template>
  <UHeader
    :ui="{ left: 'min-w-0', toggle: '-mr-1.5' }"
    mode="drawer"
    :menu="{ shouldScaleBackground: true }"
  >
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-end gap-2 font-bold text-xl text-[var(--ui-text-highlighted)] min-w-0 focus-visible:outline-[var(--ui-primary)] shrink-0"
        aria-label="Gass"
      >
        Gaas
      </NuxtLink>
    </template>
    <UNavigationMenu
      :items="computedItems"
      variant="link"
    />

    <template #right>
      <UTooltip
        text="Search"
        :kbds="['meta', 'K']"
      >
        <!-- <UContentSearchButton /> -->
      </UTooltip>
      <UColorModeSelect />
      <UDropdownMenu
        :content="{
          align: 'end',
          side: 'bottom',
        }"
        :items="userItems"
        :ui="{
          content: 'w-48',
        }"
      >
        <UButton
          icon="mdi:user"
          variant="subtle"
          color="neutral"
          size="xl"
          class="rounded-full"
        />
      </UDropdownMenu>
    </template>
    <template #content>
      <UNavigationMenu
        orientation="vertical"
        :items="computedItems"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
