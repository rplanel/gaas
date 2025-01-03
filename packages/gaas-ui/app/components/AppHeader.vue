<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const props = defineProps<{
  links: NavigationMenuItem[]
}>()
const supabase = useSupabaseClient()

async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
    return
  }

  await navigateTo('/login')
}

const userItems = ref<DropdownMenuItem[]>([
  {
    label: 'Logout',
    type: 'link',
    icon: 'tabler:logout',
    onSelect: logout,
  },
])

const items = computed(() => props.links.map(({ icon, ...link }) => link))
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
      :items="items"
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
        :items="links"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
