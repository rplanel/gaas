<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { GalaxyTypes } from '#build/types/nuxt-galaxy'
import type { AccordionItem, BreadcrumbItem } from '@nuxt/ui'
import type { GalaxyTool } from 'blendtype'
import type { GalaxyToolInputComponent } from '../../composables/galaxy/useGalaxyToolInputComponent'
import { useGalaxyDecodeParameters } from '../../composables/galaxy/useGalaxyDecodeParameters'
import { useGalaxyToolInputComponent } from '../../composables/galaxy/useGalaxyToolInputComponent'

type Database = SupabaseTypes.Database
export type InputDatasets = typeof inputs.value
export type OutputDatasets = typeof outputs.value
type RowAnalysisJob = GalaxyTypes.RowAnalysisJob

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const props = withDefaults(defineProps<Props>(), { breadcrumbsItems: undefined })

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const { breadcrumbsItems } = toRefs(props)
const route = useRoute()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const workflowParametersModel = ref<
  | Record<string, Record<string, string | string[] | Record<string, any>>>
  | undefined
>(undefined)
const analysisId = computed(() => {
  if (route?.params && 'analysisId' in route.params) {
    const analysisId = route?.params?.analysisId
    if (Array.isArray(analysisId))
      return 0
    if (analysisId !== undefined) {
      return Number.parseInt(analysisId)
    }
    return analysisId
  }
  return undefined
})

const { outputs, analysis, refresh: refreshAnalysis, inputs } = await useAnalysisDatasetIO(analysisId)

const { data: dbWorkflow } = await useAsyncData('workflow-db', async () => {
  const userVal = toValue(user)
  const analysisVal = toValue(analysis)
  if (!userVal) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: User not found',
    })
  }
  if (!analysisVal) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found: Analysis not found',
    })
  }
  const workflowIdVal = toValue(analysisVal.workflow_id)
  const { data } = await supabase
    .schema('galaxy')
    .from('workflows')
    .select('id, name, galaxy_id, definition')
    .eq('id', workflowIdVal)
    .limit(1)
    .single()
  return data
})

const workflowGalaxyId = computed(() => {
  const dbWorkflowVal = toValue(dbWorkflow)
  if (dbWorkflowVal)
    return dbWorkflowVal.galaxy_id
  return undefined
})
const {
  workflow,
  workflowSteps,
  workflowToolIds,
  stepToTool,
} = useGalaxyWorkflow(workflowGalaxyId)
const { tools, toolInputParameters } = useGalaxyTool(workflowToolIds)
const { getToolParameters, getParametersInputComponent } = useAnalysisTools()
const { jobs, jobsAccordionItems, jobsMap, jobDetailsAccordionItems } = useAnalysisJob()

// Listen to job updates
supabase
  .channel('histories')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'galaxy', table: 'histories' },
    handleUpdates,
  )
  .subscribe()

supabase
  .channel('jobs')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'galaxy', table: 'jobs' },
    handleUpdates,
  )
  .subscribe()

// Fetch data

function handleUpdates() {
  refreshAnalysis()
}

const computedBreadcrumbsItems = computed(() => {
  const analysisVal = toValue(analysis)
  const breadcrumbsItemsVal = toValue(breadcrumbsItems)
  if (analysisVal && breadcrumbsItemsVal) {
    return [
      ...breadcrumbsItemsVal.map(breadcrumb => ({ ...breadcrumb, disabled: false })),
      {
        label: analysisVal.name,
        disabled: true,
        to: `/analyses/${toValue(analysisId)}`,
      },
    ]
  }
  return breadcrumbsItemsVal
})

const history = computed(() => {
  const analysisVal = toValue(analysis)
  if (analysisVal && analysisVal.histories) {
    return analysisVal.histories
  }
  return undefined
})

function useAnalysisJob() {
  const jobs = computed<RowAnalysisJob[] | undefined>(() => {
    const analysisVal = toValue(analysis)
    if (analysisVal && analysisVal?.jobs) {
      return analysisVal.jobs
    }
    return undefined
  })

  const jobsAccordionItems = computed<AccordionItem[] | undefined>(() => {
    const jobsVal = toValue(jobs)
    const toolsVal = toValue(tools)
    if (jobsVal && toolsVal) {
      return jobsVal.map((job): AccordionItem => {
        return {
          label: `${toolsVal[job.tool_id]?.name ?? 'no tool name'} - ${
            toolsVal[job.tool_id]?.version ?? 'no tool version'
          }`,
          icon: 'i-mdi:tools',
          value: String(job.step_id),
        }
      })
    }
    return undefined
  })

  const jobsMap = computed(() => {
    const jobsVal = toValue(jobs) as RowAnalysisJob[]
    if (jobsVal) {
      const jobM: Record<string, RowAnalysisJob> = {}
      for (const job of jobsVal) {
        jobM[String(job.step_id)] = job
      }
      return jobM
    }
    return {}
  })

  const jobDetailsAccordionItems = computed(() => {
    const jobsVal = toValue(jobs)
    const perJobItems: Record<string, { details: AccordionItem[] }> = {}
    if (jobsVal) {
      for (const job of jobsVal) {
        perJobItems[job.step_id] = {
          details: [
            { label: 'Parameters', slot: 'parameters' },
            { label: 'Stdout', slot: 'stdout' },
            { label: 'Stderr', slot: 'stderr' },
          ],
        }
      }
      return perJobItems
    }
    return undefined
  })

  return { jobs, jobsAccordionItems, jobsMap, jobDetailsAccordionItems }
}

function useAnalysisTools() {
  function getToolParameters(stepId: string) {
    const stepToolsVal = toValue(stepToTool)
    const toolInputParametersVal = toValue(toolInputParameters)
    const toolName = stepToolsVal[stepId]
    if (toolName) {
      return toolInputParametersVal[toolName]
    }
  }

  const toolInputParameterComponent = computed(() => {
    const toolsVal = toValue(tools)
    if (toolsVal) {
      return Object.entries(toolsVal).reduce(
        (
          acc: Record<string, Record<string, GalaxyToolInputComponent>>,
          curr,
        ) => {
        // toolInput.
          const [toolId, tool] = curr as [string, GalaxyTool]
          const { inputComponentsObject } = useGalaxyToolInputComponent(
            tool.inputs,
          )
          if (inputComponentsObject.value)
            acc[toolId] = inputComponentsObject.value
          return acc
        },
        {} as Record<string, Record<string, GalaxyToolInputComponent>>,
      )
    }
    return undefined
  })
  function getParametersInputComponent(stepId: string) {
    const toolName = toValue(stepToTool)[stepId]
    const computedParameterInputComponentObjectVal = toValue(toolInputParameterComponent)
    if (toolName && computedParameterInputComponentObjectVal) {
      return computedParameterInputComponentObjectVal[toolName]
    }
  }

  return { tools, getToolParameters, getParametersInputComponent }
}

const pageHeaderProps = computed(() => {
  const analysisVal = toValue(analysis)
  const props = {
    title: 'Analysis',
    description: 'Analysis perform with workflow',
    ui: {
      root: 'relative border-b-0 border-[var(--ui-border)] py-8',
    },
  }
  if (analysisVal) {
    return { ...props, title: analysisVal.name }
  }
  return props
})

watchEffect(() => {
  const dbAnalysisVal = toValue(analysis) as Record<string, any> | undefined
  if (dbAnalysisVal) {
    const { decodedParameters } = useGalaxyDecodeParameters(
      dbAnalysisVal.parameters,
    )
    workflowParametersModel.value = toValue(decodedParameters)
  }
})

await useFetch('/sync')
</script>

<template>
  <PageHeader
    v-if="analysis" :page-header-props="pageHeaderProps" :breadcrumbs-items="computedBreadcrumbsItems"
    icon="i-streamline:code-analysis"
  >
    <template #description="{ description }">
      <div class="text-lg text-[var(--ui-text-muted)] mt-4">
        {{ description }}
        <UBadge variant="subtle">
          {{
            workflow?.name
          }}
        </UBadge>
      </div>
    </template>
    <template #trailing-content>
      <div v-if="history">
        <GalaxyStatus :state="history.state" :size="40" />
      </div>
    </template>
  </PageHeader>
  <div>
    <USeparator :id="`input-${analysisId}`" icon="i-lucide:file" />
    <div class="py-4">
      <h2 class="text-lg font-bold">
        Inputs
      </h2>
      <GalaxyAnalysisIoDatasets :items="inputs" />
    </div>

    <USeparator :id="`job-${analysisId}`" icon="i-mdi:tools" />

    <div v-if="jobs">
      <div class="py-4">
        <h2 class="text-lg font-bold">
          Jobs
        </h2>
      </div>

      <UPageAccordion :items="jobsAccordionItems">
        <template #leading="{ item }">
          <div>
            <GalaxyStatus :state="item?.value && jobsMap ? jobsMap[item.value]?.state : undefined" size="25" />
          </div>
        </template>
        <template #body="{ item }">
          <!-- item.value is step_id as string -->
          <div v-if="jobDetailsAccordionItems && item.value" class="p-4">
            <UPageAccordion :items="jobDetailsAccordionItems[item.value]?.details">
              <template #parameters>
                <div
                  v-if="
                    workflowSteps
                      && workflowParametersModel
                      && item.value
                  " class="p-2"
                >
                  <div class="ring ring-[var(--ui-border)] rounded-[calc(var(--ui-radius)*2)]">
                    <GalaxyWorkflowStep
                      variant="display" :workflow-step="workflowSteps[item.value]"
                      :tool-parameters="getToolParameters(item.value)"
                      :parameters-inputs-component="getParametersInputComponent(item.value)"
                      :workflow-parameters-model=" workflowParametersModel[item.value] "
                    />
                  </div>
                </div>
              </template>
              <template #stdout>
                <div class="p-1">
                  <div class="ring ring-[var(--ui-border)] rounded-[calc(var(--ui-radius)*2)] p-8 overflow-x-auto">
                    <pre v-if="jobsMap" class="text-nowrap"> {{ jobsMap[item.value]?.stdout }}</pre>
                  </div>
                </div>
              </template>
              <template #stderr>
                <div class="p-1">
                  <div class="ring ring-[var(--ui-border)] rounded-[calc(var(--ui-radius)*2)] p-8 overflow-x-auto">
                    <pre v-if="jobsMap"> {{ jobsMap[item.value]?.stderr }}</pre>
                  </div>
                </div>
              </template>
            </UPageAccordion>
          </div>
        </template>
      </UPageAccordion>
    </div>

    <!-- outputs -->
    <USeparator :id="`output-${analysisId}`" icon="i-lucide:file" />
    <div v-if="outputs">
      <div class="py-4">
        <h2 class="text-lg font-bold">
          Outputs
        </h2>
        <GalaxyAnalysisIoDatasets :items="outputs" />
      </div>
    </div>

    <NuxtPage :breadcrumbs-items="computedBreadcrumbsItems" :analysis-id="analysisId" />
  </div>
</template>
