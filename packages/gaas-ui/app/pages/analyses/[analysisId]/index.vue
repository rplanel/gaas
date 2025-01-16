<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { GalaxyTypes } from '#build/types/nuxt-galaxy'
import type { BreadcrumbItem } from '@nuxt/ui'
import { useGalaxyDecodeParameters } from '../../../composables/galaxy/useGalaxyDecodeParameters'

type Database = SupabaseTypes.Database
type AnalysisDetail = GalaxyTypes.AnalysisDetail

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
  analysisId: number
}
const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})

const { analysisId } = toRefs(props)
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

function handleUpdates() {
  refreshAnalysis()
}

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
