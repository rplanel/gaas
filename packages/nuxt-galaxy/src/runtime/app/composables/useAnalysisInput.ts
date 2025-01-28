import type { AsyncDataExecuteOptions } from '#app/composables/asyncData'
import type { ComputedRef, MaybeRef, Ref } from '#imports'
import type { Database } from '../../types/database'
import type { AnalysisDetail, RowAnalaysisDataset } from '../../types/nuxt-galaxy'
import { computed, createError, toValue, useAsyncData, useSupabaseClient, useSupabaseUser } from '#imports'

interface Inputs extends RowAnalaysisDataset {
  state: Database['galaxy']['Enums']['dataset_state']
}

export async function useAnalysisInput(analysisId: MaybeRef<number | undefined>): Promise<{
  inputs: ComputedRef<Inputs[] | undefined>
  analysis: Ref<AnalysisDetail | null>
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>
}> {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const { data: analysis, refresh } = await useAsyncData<AnalysisDetail | null>(
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
      return null
    },
  )
  const inputs = computed(() => {
    const analysisVal = toValue(analysis)
    if (analysisVal && analysisVal?.analysis_inputs) {
      return analysisVal.analysis_inputs.map((input): Inputs => {
        return {
          ...input.datasets,
          state: input.state,
        }
      })
    }
    return undefined
  })
  return { inputs, analysis, refresh }
}
