<script setup lang="ts">
import type { Database, GalaxyWorkflowExportSchema, RowWorkflow, SanitizedWorkflowDbItem } from '../types'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { galaxyWorkflowExportSchema } from 'blendtype'
import { z } from 'zod'
import { fromError } from 'zod-validation-error'

definePageMeta({
  layout: 'dashboard',
})

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const { userRole } = useUserRole(supabase)

const selectedWorkflow = ref<SanitizedWorkflowDbItem | undefined>()
const isWorkflowRunPanelOpen = computed({
  get() {
    return !!selectedWorkflow.value
  },
  set(value: boolean) {
    if (!value) {
      selectedWorkflow.value = undefined
    }
  },
})
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

const { data: dbWorkflows } = await useAsyncData('workflows-auth', async () => {
  const userVal = toValue(user)
  if (userVal) {
    const { data } = await supabase
      .schema('galaxy')
      .from('workflows')
      .select()
      .returns<RowWorkflow[]>()
    return data
  }
})

const sanitizedDbWorkflows = computed<SanitizedWorkflowDbItem[] | null>(() => {
  const dbWorkflowsVal = toValue(dbWorkflows)
  if (dbWorkflowsVal) {
    return dbWorkflowsVal.map<SanitizedWorkflowDbItem>((wf) => {
      try {
        const definition: GalaxyWorkflowExportSchema = galaxyWorkflowExportSchema.passthrough().parse(wf.definition)
        return { ...wf, definition }
      }
      catch (err) {
        if (err instanceof z.ZodError) {
          const sanitizedErr = fromError(err)
          throw createError({ statusMessage: sanitizedErr.message, cause: sanitizedErr.cause, stack: sanitizedErr.stack, name: sanitizedErr.name })
        }
        throw createError({
          statusCode: getStatusCode(err),
          statusMessage: getErrorMessage(err),
        })
      }
    })
  }
  return null
})
const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')
</script>

<template>
  <UDashboardPanel id="workflows-list" title="Workflows" :default-size="25" :min-size="20" :max-size="35" resizable>
    <UDashboardNavbar title="Workflows">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #trailing>
        <UBadge :label="sanitizedDbWorkflows?.length ?? 0" variant="subtle" />
      </template>
      <template v-if="userRole === 'admin'" #right>
        <UButton icon="i-lucide-plus" size="md" class="rounded-full" to="/admin/workflows" />
      </template>
    </UDashboardNavbar>
    <WorkflowListPanel v-model="selectedWorkflow" :workflows="sanitizedDbWorkflows" :breadcrumbs-items="breadcrumbsItems" />
  </UDashboardPanel>

  <WorkflowRunPanel v-if="selectedWorkflow" :workflow="selectedWorkflow" @close="selectedWorkflow = undefined" />
  <div v-else class="hidden lg:flex flex-1 items-center justify-center">
    <UIcon name="i-lucide-inbox" class="size-32 text-(--ui-text-dimmed)" />
  </div>
  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isWorkflowRunPanelOpen">
      <template #content>
        <div v-if="selectedWorkflow" :mail="selectedWorkflow" @close="selectedWorkflow = undefined">
          is a mobile
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>
