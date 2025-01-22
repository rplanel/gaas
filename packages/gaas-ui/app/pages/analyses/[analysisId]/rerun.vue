<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { GalaxyTypes } from '#build/types/nuxt-galaxy'
import type { BreadcrumbItem } from '@nuxt/ui'

type Database = SupabaseTypes.Database
type AnalysisDetail = GalaxyTypes.AnalysisDetail
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

const pageHeaderProps = computed(() => {
  const analysisVal = toValue(analysis)
  const props = {
    title: 'Rerun analysis',
    description: 'Rerun the analysis',

  }
  if (analysisVal) {
    return { ...props, title: analysisVal.name }
  }
  return props
})
</script>

<template>
  <div v-if="workflowId && analysis">
    <PageHeader
      :page-header-props
      :breadcrumbs-items="computedBreadcrumbsItems"
      icon="i-streamline:code-analysis"
    />

    <GalaxyWorkflowInvokeForm v-if="analysisId && workflowId" :workflow-id="workflowId" :analysis-id="analysisId" />
  </div>
</template>
