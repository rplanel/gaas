<script setup lang="ts">
import type { Database } from '#build/types/database'
import { getErrorMessage, getStatusCode } from 'blendtype'

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const props = withDefaults(defineProps<Props>(), { breadcrumbsItems: undefined })

const { breadcrumbsItems } = toRefs(props)
const supabase = useSupabaseClient<Database>()
const noUsers = ref(false)
const { userRole } = useUserRole(supabase)

const computedBreadcrumbsItems = computed(() => {
  const breadcrumbsItemsVal = toValue(breadcrumbsItems)
  if (breadcrumbsItemsVal) {
    return [
      ...breadcrumbsItemsVal.map(breadcrumb => ({ ...breadcrumb, disabled: false })),
      {
        label: 'User and roles',
        disabled: true,
        to: '/admin/users',
      },
    ]
  }
  return breadcrumbsItemsVal
})

const { data: listUsers } = await useAsyncData('list-app-users', async () => {
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers()

  if (error) {
    noUsers.value = true
    throw createError({
      statusMessage: getErrorMessage(error),
      statusCode: getStatusCode(error),
    })
  }

  return users
})
</script>

<template>
  <div>
    <div v-if="userRole === 'admin'" class="my-5">
      <PageHeader
        title="Manage users and roles" description="Manage the user and roles of the web application"
        :breadcrumbs-items="computedBreadcrumbsItems"
      />
      <div v-if="noUsers">
        <UAlert
          title="Permissions" description="You don't have the permissions to display the list of all users"
          icon="i-lucide:user-x" color="error" variant="soft"
        />
      </div>
      <div v-else>
        <pre>{{ listUsers }}</pre>
      </div>
    </div>
  </div>
</template>
