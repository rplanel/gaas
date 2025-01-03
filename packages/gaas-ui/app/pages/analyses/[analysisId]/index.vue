<script setup lang="ts">
import type { Database } from '#build/types/database'
import type { AnalysisDetail, AnalysisOutputsWithDatasets, RowAnalysisJob } from '#build/types/nuxt-galaxy'
import type { AccordionItem, BreadcrumbItem } from '@nuxt/ui'
import type { GalaxyTool, GalaxyToolParameters } from 'blendtype'
import GalaxyStatus from '../../../components/galaxy/GalaxyStatus.vue'
import { useGalaxyDecodeParameters } from '../../../composables/galaxy/useGalaxyDecodeParameters'
import {
  type GalaxyToolInputComponent,
  useGalaxyToolInputComponent,
} from '../../../composables/galaxy/useGalaxyToolInputComponent'

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
  analysisId: number
}
const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})

const { breadcrumbsItems, analysisId } = toRefs(props)
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const route = useRoute()

definePageMeta({
  middleware: 'auth',
})

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

const workflowParametersModel = ref<
  | Record<string, Record<string, string | string[] | Record<string, any>>>
  | undefined
>(undefined)

const { data: analysis, refresh: refreshAnalysis } = await useAsyncData(
  `analysis-details-${toValue(analysisId)}`,
  async () => {
    const analysisVal = toValue(analysisId)
    const userVal = toValue(user)
    if (userVal && analysisVal) {
      const { data, error } = await supabase
        .schema('galaxy')
        .from('analyses')
        .select(
          `
        *,
        histories(*),
        jobs(*),
        workflows(*),
        analysis_inputs(
            *,
            datasets(*)
        ),
        analysis_outputs(
            *,
            datasets(*)
        )
    `,
        )
        .eq('id', analysisVal)
        .limit(1)
        .returns<AnalysisDetail[]>()

      if (error) {
        throw createError({
          statusMessage: error.message,
          statusCode: Number.parseInt(error.code),
        })
      }
      return data ? data[0] : data
    }
    return false
  },
)

const { data: dbWorkflow } = await useAsyncData('workflow-db', async () => {
  const userVal = toValue(user)
  const workflowIdVal = toValue(analysis.value?.workflow_id)
  if (userVal && workflowIdVal) {
    const { data } = await supabase
      .schema('galaxy')
      .from('workflows')
      .select('id, name, galaxy_id, definition')
      .eq('id', workflowIdVal)
      .limit(1)
      .single()
    return data
  }
  return false
})

const workflowGalaxyId = computed(() => {
  const dbWorkflowVal = toValue(dbWorkflow)
  if (dbWorkflowVal)
    return dbWorkflowVal.galaxy_id
  return undefined
})

const { data: workflowRun } = await useFetch(
  `/api/galaxy/workflows/${toValue(workflowGalaxyId)}/input`,
)

function handleUpdates() {
  refreshAnalysis()
}

const inputs = computed(() => {
  const analysisVal = toValue(analysis)
  if (analysisVal && analysisVal?.analysis_inputs) {
    return analysisVal.analysis_inputs.map((input) => {
      return {
        ...input.datasets,
        state: input.state,
      }
    })
  }
  return undefined
})

export type InputDatasets = typeof inputs.value

const outputs = computed(() => {
  const analysisVal = toValue(analysis)
  if (analysisVal && analysisVal?.analysis_outputs) {
    return analysisVal.analysis_outputs.map((output: AnalysisOutputsWithDatasets) => {
      // const { fileSize } = useFileSize(output.datasets.file_size);
      return {
        ...output.datasets,
        state: output.state,
        // humanFileSize: fileSize,
      }
    })
  }
  return undefined
})

export type OutputDatasets = typeof outputs.value

const jobs = computed<RowAnalysisJob[] | undefined>(() => {
  const analysisVal = toValue(analysis)
  if (analysisVal && analysisVal?.jobs) {
    return analysisVal.jobs
  }
  return undefined
})

const jobsMap = computed(() => {
  const jobsVal = toValue(jobs)
  if (jobsVal) {
    const jobM: Record<number, RowAnalysisJob> = {}
    for (const job of jobsVal) {
      jobM[job.step_id] = job
    }
    return jobM
  }
  return undefined
})

const tools = computed(() => {
  const workflowRunVal = toValue(workflowRun)
  if (workflowRunVal?.tools) {
    return workflowRunVal.tools
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

const workflowSteps = computed(() => {
  const workflowRunVal = toValue(workflowRun)
  if (workflowRunVal?.galaxyWorkflow?.steps) {
    return workflowRunVal.galaxyWorkflow.steps
  }
  return undefined
})
const sanitizedToolsParameters = computed(() => {
  const workflowRunVal = toValue(workflowRun)
  if (workflowRunVal) {
    const toolsInputs: Record<string, GalaxyToolParameters[]> = {}
    for (const toolId in workflowRunVal.tools) {
      toolsInputs[toolId] = workflowRunVal.tools[toolId].inputs.filter(
        input => input.type !== 'data',
      )
    }
    return toolsInputs
  }
  return undefined
})

const history = computed(() => {
  const analysisVal = toValue(analysis)
  if (analysisVal && analysisVal.histories) {
    return analysisVal.histories
  }
  return undefined
})

const computedParameterInputComponentObject = computed(() => {
  const worklowRunVal = toValue(workflowRun)
  if (worklowRunVal?.tools) {
    return Object.entries(worklowRunVal.tools).reduce(
      (
        acc: Record<string, Record<string, GalaxyToolInputComponent>>,
        [toolId, tool]: [string, GalaxyTool],
      ) => {
        // toolInput.
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

onMounted(() => {
  const dbAnalysisVal = toValue(analysis) as Record<string, any>

  const { decodedParameters } = useGalaxyDecodeParameters(
    dbAnalysisVal.parameters,
  )
  workflowParametersModel.value = toValue(decodedParameters)
})
await useFetch('/sync')
</script>

<template>
  <div>
    <PageHeader
      v-if="analysis" :title="analysis.name" description="Analysis perform with workflow"
      icon="i-streamline:code-analysis" :breadcrumbs-items="breadcrumbsItems"
    >
      <template #description="{ description }">
        <div class="text-lg text-[var(--ui-text-muted)] mt-4">
          {{ description }}
          <UBadge variant="subtle">
            {{
              workflowRun?.galaxyWorkflow.name
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
    <USeparator icon="i-lucide:file" />
    <div class="py-4">
      <h2 class="text-lg font-bold">
        Inputs
      </h2>

      <GalaxyAnalysisIoDatasets :items="inputs" />
    </div>
    <USeparator icon="i-mdi:tools" />

    <div v-if="jobs">
      <div class="py-4">
        <h2 class="text-lg font-bold">
          Jobs
        </h2>
      </div>

      <UAccordion
        :items="jobsAccordionItems" :ui="{
          header:
            'flex hover:bg-[var(--ui-bg-elevated)] px-2 rounded-[calc(var(--ui-radius))] grid grid-flow-col align-middle',
          trailingIcon: 'shrink-1 shrink-none',
        }"
      >
        <template #leading="{ item }">
          <div>
            <GalaxyStatus v-if="jobsMap" :state="item?.value ? jobsMap[item.value].state : undefined" size="25" />
          </div>
        </template>
        <template #body="{ item }">
          <!-- item.value is step_id as string -->
          <div v-if="jobDetailsAccordionItems" class="p-4">
            <UAccordion
              :items="jobDetailsAccordionItems[item.value].details" :ui="{
                header:
                  'hover:bg-[var(--ui-bg-elevated)] px-2 rounded-[calc(var(--ui-radius))]',
              }"
            >
              <template #parameters>
                <div
                  v-if="
                    workflowParametersModel
                      && workflowSteps
                      && sanitizedToolsParameters
                      && computedParameterInputComponentObject
                      && workflowRun?.stepToTool
                  " class="p-2"
                >
                  <div class="ring ring-[var(--ui-border)] rounded-[calc(var(--ui-radius)*2)]">
                    <GalaxyWorkflowStep
                      variant="display" :workflow-step="workflowSteps[item.value]" :tool-parameters="
                        sanitizedToolsParameters[
                          workflowRun.stepToTool[item.value]
                        ]
                      " :parameters-inputs-component="
                        computedParameterInputComponentObject?.[
                          workflowRun?.stepToTool?.[item.value]
                        ]
                      " :workflow-parameters-model="
                        workflowParametersModel[item.value]
                      "
                    />
                  </div>
                </div>
              </template>
              <template #stdout>
                <div class="p-1">
                  <div class="ring ring-[var(--ui-border)] rounded-[calc(var(--ui-radius)*2)] p-2">
                    <pre> {{ jobsMap[item.value].stdout }}</pre>
                  </div>
                </div>
              </template>
              <template #stderr>
                <div class="p-1">
                  <div class="ring ring-[var(--ui-border)] rounded-[calc(var(--ui-radius)*2)] p-2">
                    <pre> {{ jobsMap[item.value].stderr }}</pre>
                  </div>
                </div>
              </template>
            </UAccordion>
          </div>
        </template>
      </UAccordion>

      <GalaxyStatus v-if="jobsMap" :state="item?.value ? jobsMap[item.value].state : undefined" size="25" />
    </div>
    <USeparator icon="i-lucide:file" />

    <div v-if="outputs">
      <div class="py-4">
        <h2 class="text-lg font-bold">
          Outputs
        </h2>

        <GalaxyAnalysisIoDatasets :items="outputs" />
      </div>
    </div>
    <USeparator icon="tabler:chart-scatter" />
    <div>
      <div class="py-4">
        <UButton block size="xl" label="Display the results" variant="soft" :to="`${route.path}/results`">
          Display results
        </UButton>
      </div>
    </div>
  </div>
</template>
