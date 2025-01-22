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
const router = useRouter()
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

async function resetError(error: Ref<unknown>) {
  error.value = null
  await router.push('/workflows')
}

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
const pageHeaderProps = computed(() => {
  return {
    title: 'Run',
    description: 'Choose datasets, set parameters and invoke a workflow.',

  }
})
// get workflow input
</script>

<template>
  <div>
    <PageHeader
      :page-header-props
      icon="i-lucide:workflow"
      :breadcrumbs-items="breadcrumbsItems"
    />

    <template v-if="workflowGalaxyId">
      <NuxtErrorBoundary>
        <GalaxyWorkflowInvokeForm
          v-if="showWorkflowStepParameter && workflowId"
          :workflow-id="workflowId"
        />
        <template #error="{ error }">
          <div class="p-4 m-2">
            <UAlert
              color="error" variant="soft" title="Error" :description="error" icon="i-material-symbols:error"
              :actions="[
                {
                  label: 'List available workflows',
                  onClick() {
                    resetError(error);
                  },
                },
              ]"
            />
          </div>
        </template>
      </NuxtErrorBoundary>
    </template>
  </div>
</template>
