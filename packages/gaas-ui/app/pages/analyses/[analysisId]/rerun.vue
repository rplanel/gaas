<script setup lang="ts">
import type { Database } from '#build/types/database'
import type { AnalysisDetail } from '#build/types/nuxt-galaxy'
import type { BreadcrumbItem } from '@nuxt/ui'

const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})

definePageMeta({
  middleware: 'auth',
})

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
  analysisId: number
}
const { breadcrumbsItems, analysisId } = toRefs(props)
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const workflowInputsModel = ref<undefined | Record<string, any>>({})

const { data: analysis } = await useAsyncData(
  `analysis-${toValue(analysisId)}`,
  async () => {
    const userVal = toValue(user)
    const analysisIdVal = toValue(analysisId)
    if (userVal && analysisIdVal) {
      const { data, error } = await supabase
        .schema('galaxy')
        .from('analyses')
        .select(
          `
        *,
        workflows(*)`,
        )
        .eq('id', analysisIdVal)
        .limit(1)
        .returns<AnalysisDetail[]>()

      if (error) {
        throw createError({
          statusMessage: error.message,
          statusCode: Number.parseInt(error.code),
        })
      }
      workflowInputsModel.value = data[0]?.analysis_inputs
      return data ? data[0] : data
    }
  },
)

const computedBreadcrumbsItems = computed(() => {
  const analysisVal = toValue(analysis)
  const breadcrumbsItemsVal = toValue(breadcrumbsItems)
  if (analysisVal && breadcrumbsItemsVal) {
    return [
      ...breadcrumbsItemsVal.map(breadcrumb => ({ ...breadcrumb, disabled: false })),
      {
        label: `Copy of ${analysisVal.name}`,
        disabled: true,
      },
    ]
  }
  return toValue(breadcrumbsItems)
})

const workflowId = computed(() => {
  const analysisVal = toValue(analysis)
  return analysisVal?.workflows.id
})
</script>

<template>
  <div v-if="workflowId && analysis">
    <PageHeader
      :title="analysis.name" description="Rerun the analysis" icon="i-streamline:code-analysis"
      :breadcrumbs-items="computedBreadcrumbsItems"
    />

    <GalaxyWorkflowInvokeForm v-if="analysisId && workflowId" :workflow-id="workflowId" :analysis-id="analysisId" />
  </div>
</template>
