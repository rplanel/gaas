<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { BreadcrumbItem } from '@nuxt/ui'

import {
  definePageMeta,
  useAsyncData,
  useRoute,
  useState,
  useSupabaseClient,
  useSupabaseUser,
} from '#imports'
import { computed, toValue } from 'vue'

type Database = SupabaseTypes.Database

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
  analysisId: number
}
const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})

const { breadcrumbsItems } = toRefs(props)

const showWorkflowStepParameter = useState<boolean>(
  'showWorkflowStepParameter',
)
showWorkflowStepParameter.value = true
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
definePageMeta({
  middleware: 'auth',
})
const route = useRoute()

const workflowId = computed(() => {
  const wfId = route?.params?.workflowId
  if (!Array.isArray(wfId) && wfId !== undefined) {
    return Number.parseInt(wfId)
  }
  return undefined
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
const workflowGalaxyId = computed(() => {
  const dbWorkflowVal = toValue(dbWorkflow)
  if (dbWorkflowVal)
    return dbWorkflowVal.galaxy_id
  return undefined
})

// get workflow input
</script>

<template>
  <div>
    <PageHeader
      title="Run"
      description="Choose datasets, set parameters and invoke a workflow."
      icon="i-lucide:workflow"
      :breadcrumbs-items="breadcrumbsItems"
    />

    <template v-if="workflowGalaxyId">
      <GalaxyWorkflowInvokeForm
        v-if="showWorkflowStepParameter && workflowId"
        :workflow-id="workflowId"
      />
    </template>
  </div>
</template>
