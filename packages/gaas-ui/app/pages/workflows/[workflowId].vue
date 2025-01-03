<script setup lang="ts">
import type { Database } from '#build/types/database'
import type { BreadcrumbItem } from '@nuxt/ui'

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const props = withDefaults(defineProps<Props>(), { breadcrumbsItems: undefined })
const { breadcrumbsItems } = toRefs(props)
const route = useRoute()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()

const workflowId = computed(() => {
  const workflowId = route?.params?.workflowId
  if (Array.isArray(workflowId))
    return 0
  if (workflowId) {
    return Number.parseInt(workflowId)
  }
  return workflowId
})

const { data: dbWorkflow } = await useAsyncData('workflow-db', async () => {
  const userVal = toValue(user)
  const workflowIdVal = toValue(workflowId)
  if (userVal && workflowIdVal) {
    const { data } = await supabase
      .schema('galaxy')
      .from('workflows')
      .select('id, name, galaxy_id')
      .eq('id', workflowIdVal)
      .limit(1)
      .single()
    return data
  }
})

const computedBreadcrumbsItems = computed(() => {
  const workflowVal = toValue(dbWorkflow)
  const breadcrumbsItemsVal = toValue(breadcrumbsItems)
  if (workflowVal && breadcrumbsItemsVal) {
    return [
      ...breadcrumbsItemsVal.map(b => ({ ...b, disabled: false })),
      {
        label: workflowVal.name,
        disabled: true,
      },
    ]
  }
  return toValue(breadcrumbsItems)
})
</script>

<template>
  <div>
    <NuxtPage :breadcrumbs-items="computedBreadcrumbsItems" :workflow-id />
  </div>
</template>
