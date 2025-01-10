<!-- eslint-disable ts/no-use-before-define -->
<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { AccordionItem } from '@nuxt/ui'
import type { Props as WorkflowStepProps } from '../../../components/galaxy/workflow/Step.vue'
import { computed, onMounted, ref, toValue, useFetch } from '#imports'
import {
  type GalaxyTool,
  type GalaxyToolParameters,
  type GalaxyWorkflow,
  getErrorMessage,
  getStatusCode,
} from 'blendtype'
import { z } from 'zod'
import { useGalaxyDecodeParameters } from '../../../composables/galaxy/useGalaxyDecodeParameters'
import { useGalaxyEncodeParameters } from '../../../composables/galaxy/useGalaxyEncodeParameters'
import {
  type GalaxyToolInputComponent,
  useGalaxyToolInputComponent,
} from '../../../composables/galaxy/useGalaxyToolInputComponent'

type Database = SupabaseTypes.Database
export type UploadedDatasetDb = Database['galaxy']['Tables']['uploaded_datasets']['Row']

export interface Props {
  workflowId: number
  analysisId?: number
}
const props = withDefaults(defineProps<Props>(), {})
const router = useRouter()

export type WorkflowParameterValue =
  | string
  | string[]
  | Record<string | number, WorkflowParameterConditionalValue>

interface WorkflowParameterConditionalValue {
  [key: string]: WorkflowParameterValue
}

const startingAnalysis = ref<boolean>(false)
const workflowInputDatasetsModel = ref<
  Record<string, UploadedDatasetDb> | undefined
>({})

const workflowParametersModel = ref<
  | Record<string, Record<string, string | string[] | Record<string, any>>>
  | undefined
>(undefined)
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
// const analysisName = ref<string | undefined>(undefined)

onMounted(() => {
  const workflowRunVal = toValue(workflowRun)
  const dbAnalysisVal = toValue(dbAnalysis) as Record<string, any>
  const workflowStepsVal = toValue(workflowSteps)
  if (props.analysisId && dbAnalysisVal) {
    state.analysisName = `Copy of ${dbAnalysisVal.name}`
    const { decodedParameters } = useGalaxyDecodeParameters(
      dbAnalysisVal.parameters,
    )
    workflowParametersModel.value = toValue(decodedParameters)
    workflowInputDatasetsModel.value = dbAnalysisVal.datamap
  }
  else if (workflowRunVal && workflowStepsVal) {
    workflowParametersModel.value = Object.entries(workflowStepsVal).reduce(
      (acc, [stepId, step]) => {
        if (step.type === 'tool')
          acc[stepId] = step.tool_inputs
        return acc
      },
      {} as Record<string, Record<string, any>>,
    )
  }
})

const schema = z.object({
  analysisName: z.string().max(256, 'Must be less than 256'),

})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  analysisName: undefined,
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

const workflowSteps = computed(() => {
  const workflowRunVal = toValue(workflowRun)
  if (workflowRunVal?.galaxyWorkflow?.steps) {
    return workflowRunVal.galaxyWorkflow.steps
  }
  return undefined
})

const workflowStepsItems = computed<AccordionItem[] | undefined>(() => {
  const workflowStepsVal = toValue(workflowSteps)

  if (workflowStepsVal) {
    return Object.entries(workflowStepsVal)
      .filter(([_, step]) => step.type === 'tool' && step.tool_id !== null)
      .map(([stepId, step]) => {
        const toolId = step.tool_id
        const toolsDetails = toolId?.split('/').slice(-2)
        if (toolsDetails?.length === 2) {
          return { value: stepId, label: toolsDetails[0] }
        }
        return { value: stepId }
      })
  }
  return undefined
})

const workflowStepsToolInfo = computed(() => {
  const workflowStepsVal = toValue(workflowSteps)
  const tools = toValue(sanitizedTools)
  if (workflowStepsVal && tools) {
    const wfStepsToolInfo: {
      [stepId: string]: {
        name: string
        version: string
        description: string
      }
    } = {}
    for (const stepId in workflowStepsVal) {
      const toolId = workflowStepsVal[stepId]?.tool_id
      // const toolId = wfStep.tool_id
      if (toolId) {
        const toolsDetails = toolId?.split('/').slice(-2)
        if (toolsDetails?.length === 2) {
          wfStepsToolInfo[stepId] = {
            name: toolsDetails?.[0] ?? '',
            version: toolsDetails?.[1] ?? '',
            description: toolId !== null ? tools[toolId]?.description ?? '' : '',
          }
        }
      }
    }
    return wfStepsToolInfo
  }
  return undefined
})

const sanitizedWorkflowInputs = computed(() => {
  const workflowRunVal = toValue(workflowRun)
  return workflowRunVal?.galaxyWorkflow?.inputs
})

const sanitizedTools = computed(() => {
  const workflowRunVal = toValue(workflowRun)
  return workflowRunVal?.tools
})

const sanitizedToolsParameters = computed(() => {
  const sanitizedToolsVal = toValue(sanitizedTools)
  let toolsInputs: Record<string, GalaxyToolParameters[]> | undefined
  if (sanitizedToolsVal) {
    toolsInputs = {}
    for (const toolId in sanitizedToolsVal) {
      const toolParams = toValue(sanitizedTools)?.[toolId]
      if (toolParams) {
        toolsInputs[toolId] = toolParams.inputs.filter(
          input => input.type !== 'data',
        )
      }
    }
  }
  return toolsInputs
})

const galaxyWorkflowStepProps = computed(
  () => {
    const workflowStepsItemsVal = toValue(workflowStepsItems)
    const workflowStepsVal = toValue(workflowSteps)
    const sanitizedToolsParametersVal = toValue(sanitizedToolsParameters)
    const computedParameterInputComponentObjectVal = toValue(
      computedParameterInputComponentObject,
    )
    const workflowParametersModelVal = toValue(workflowParametersModel)
    let props: Record<string, Omit<WorkflowStepProps, 'variant'>> | undefined

    if (
      workflowStepsItemsVal
      && workflowStepsVal
      && sanitizedToolsParametersVal
      && computedParameterInputComponentObjectVal
      && workflowParametersModelVal
    ) {
      for (const item of workflowStepsItemsVal) {
        const { value: stepId } = item
        if (stepId) {
          const workflowStep = workflowStepsVal[stepId]
          if (workflowStep) {
            const toolId = workflowStep.tool_id
            if (toolId !== null) {
              props = {}
              props[stepId] = {
                workflowStep,
                toolParameters: sanitizedToolsParametersVal[toolId],
                parametersInputsComponent:
                computedParameterInputComponentObjectVal[toolId],
                workflowParametersModel: workflowParametersModelVal[stepId],
              }
            }
          }
        }
      }
    }
    return props
  },
)

async function runAnalysis() {
  const workflowInputsModelVal = toValue(workflowInputDatasetsModel)
  const analysesNameVal = state.analysisName
  const workflowIdVal = toValue(props.workflowId)
  const workflowParametersModelVal = toValue(workflowParametersModel)
  if (workflowParametersModelVal) {
    const { encodedParameters } = useGalaxyEncodeParameters(
      workflowParametersModelVal,
    )
    const parameters = toValue(encodedParameters)
    if (workflowInputsModelVal && analysesNameVal && workflowIdVal) {
      const payload = {
        name: analysesNameVal,
        datamap: workflowInputsModelVal,
        parameters,
        workflowId: workflowIdVal,
      }
      startingAnalysis.value = true
      try {
        const { id: newAnalysisId } = await $fetch('/api/db/analyses', {
          method: 'POST',
          body: payload,
        })
        $fetch('/sync')
        router.push(`/analyses/${newAnalysisId}`)
      }
      catch (error) {
        createError({ statusCode: getStatusCode(error), statusMessage: getErrorMessage(error) })
      }
      finally {
        startingAnalysis.value = false
      }
    }
  }
}

const { data: dbWorkflow } = await useAsyncData('workflow-db', async () => {
  const userVal = toValue(user)
  const workflowIdVal = toValue(props.workflowId)
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
})

const { data: dbAnalysis } = await useAsyncData('analysis-db', async () => {
  const userVal = toValue(user)

  // const workflowIdVal = toValue(props.workflowId);
  const analysisId = toValue(props.analysisId)
  if (userVal && analysisId) {
    const { data } = await supabase
      .schema('galaxy')
      .from('analyses')
      .select(`*,jobs(*)`)
      .eq('id', analysisId)
      .limit(1)
      .single()
    return data
  }
})

const workflowGalaxyId = computed(() => {
  const dbWorkflowVal = toValue(dbWorkflow)
  return dbWorkflowVal?.galaxy_id
})

const workflowDefinition = computed<GalaxyWorkflow | undefined>(() => {
  const dbWorkflowVal = toValue(dbWorkflow)
  const definition = dbWorkflowVal?.definition as unknown
  return definition as GalaxyWorkflow
})

const { data: datasets } = await useAsyncData(
  'analysis-input-datasets',
  async (): Promise<UploadedDatasetDb[]> => {
    const userVal = toValue(user)
    if (!userVal) {
      throw createError({ statusMessage: 'No uploaded datasets', statusCode: 500 })
    }
    const { data, error } = await supabase
      .schema('galaxy')
      .from('uploaded_datasets')
      .select()
      .returns<UploadedDatasetDb[]>()

    if (error) {
      throw createError({ statusCode: getStatusCode(error), statusMessage: getErrorMessage(error) })
    }
    if (data === null) {
      throw createError({ statusMessage: 'No uploaded datasets', statusCode: 500 })
    }
    return data
  },
)

const { data: workflowRun, error } = await useFetch<{
  galaxyWorkflow: GalaxyWorkflow
  tools: Record<string, GalaxyTool>
}>(`/api/galaxy/workflows/${toValue(workflowGalaxyId)}/input`)

if (error) {
  createError('There was an error fetching workflow inputs and parameters')
}
</script>

<template>
  <UCard class="mt-5">
    <template #header>
      <div class="grid grid-flow-col auto-cols-auto justify-between">
        <div class="break-normal">
          <div class="text-[var(--ui-primary)] font-bold text-lg self-center">
            {{ dbWorkflow?.name }}
          </div>
          <div
            v-if="workflowDefinition?.annotation"
            class="text-sm font-medium text-[var(--ui-text-muted)]"
          >
            {{ workflowDefinition.annotation }}
          </div>
        </div>
        <div class="flex-initial self-center">
          <VersionBadge :version="workflowDefinition?.version.toString()" />
        </div>
      </div>
    </template>
    <div>
      <UForm :schema="schema" :state="state" @submit.prevent="runAnalysis">
        <UFormField
          label="Name of the analysis"
          name="analysisName"
          required
        >
          <UInput
            v-model="state.analysisName"
            type="text"
            name="name"
            placeholder="Enter the name of the analysis"
            class="w-full"
          />
        </UFormField>
        <USeparator
          icon="i-lucide-files"
          class="mt-5 mb-3"
        />

        <h3 class="font-bold text-lg">
          Datasets
        </h3>

        <div
          v-for="(input, stepId) in sanitizedWorkflowInputs"
          :key="stepId"
        >
          <div
            v-if="datasets && workflowInputDatasetsModel"
            class="my-5"
          >
            <UFormField
              :label="input.label"
              required
              :name="input.uuid"
            >
              <USelectMenu
                v-model="workflowInputDatasetsModel[stepId]"
                :search-input="{
                  placeholder: 'Filter...',
                  icon: 'i-lucide-search',
                }"
                icon="i-material-symbols:dataset"
                :items="datasets"
                label-key="name"
                class="w-full"
                :name="input.uuid"
              />
            </UFormField>
          </div>
        </div>
        <USeparator
          icon="i-lucide:workflow"
          class="mt-5 mb-3"
        />
        <h3 class="font-bold text-lg">
          Select workflow parameters
        </h3>
        <div v-if="workflowStepsToolInfo">
          <UAccordion
            :items="workflowStepsItems"
            :ui="{
              header:
                'hover:bg-[var(--ui-bg-elevated)] px-2 rounded-[calc(var(--ui-radius))]',

            }"
          >
            <template #default="{ item: { value: stepId } }">
              <div
                v-if="stepId !== undefined"
                class="grid grid-flow-col auto-cols-auto items-center justify-between w-full gap-5 break-words"
              >
                <div class="grid grid-flow-row auto-rows-auto break-words">
                  <div class="font-bold text-[var(--ui-info)] grow break-all">
                    {{ workflowStepsToolInfo[stepId]?.name }}
                  </div>
                  <div class="font-medium text-sm opacity-60 grow break-words">
                    {{ workflowStepsToolInfo[stepId]?.description }}
                  </div>
                </div>
                <div>
                  <VersionBadge
                    :version="workflowStepsToolInfo[stepId]?.version"
                  />
                </div>
              </div>
            </template>
            <template #body="{ item: { value: stepId } }">
              <div class="p-2">
                <div
                  class="ring ring-[var(--ui-border)] rounded-[calc(var(--ui-radius)*2)]"
                >
                  <GalaxyWorkflowStep
                    v-if="stepId !== undefined && galaxyWorkflowStepProps?.[stepId]"
                    v-bind="galaxyWorkflowStepProps[stepId]"
                    variant="form"
                  />
                </div>
              </div>
            </template>
          </UAccordion>
          <USeparator class="mt-5 mb-3" />
        </div>

        <UButton
          type="submit"
          :loading="startingAnalysis"
        >
          Run
        </UButton>
      </UForm>
    </div>
  </UCard>
</template>
