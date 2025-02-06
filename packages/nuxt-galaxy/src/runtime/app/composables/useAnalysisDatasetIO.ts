import type { AsyncDataExecuteOptions } from '#app/composables/asyncData'
import type { ComputedRef, MaybeRef, Ref } from '#imports'
import type { DatasetState } from 'blendtype'
import type { Database } from '../../types/database'
import type { AnalysisDetail, RowAnalaysisDataset } from '../../types/nuxt-galaxy'
import {
  computed,
  createError,
  toValue,
  useAsyncData,
  useSupabaseClient,
} from '#imports'

interface Input extends RowAnalaysisDataset {
  state: DatasetState
}
interface Output extends RowAnalaysisDataset {
  state: DatasetState
}

export async function useAnalysisDatasetIO(analysisId: MaybeRef<number | undefined>): Promise<{
  inputs: ComputedRef<Input[] | undefined>
  outputs: ComputedRef<Output[] | undefined>
  analysis: Ref<AnalysisDetail | null>
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>
}> {
  const { data: analysis, refresh } = await useAsyncData<AnalysisDetail | null>(
    `analysis-details-${toValue(analysisId)}`,
    async () => {
      const supabase = useSupabaseClient<Database>()
      // const user = useSupabaseUser()
      const analysisVal = toValue(analysisId)
      // const userVal = toValue(user)

      // if (!userVal) {
      //   throw createError({
      //     statusCode: 401,
      //     statusMessage: 'Unauthorized: User not found',
      //   })
      // }
      if (!analysisVal) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Analysis not found',
        })
      }
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
      if (data.length === 1) {
        return data[0]
      }
      else {
        throw createError({
          statusMessage: 'No analysis found',
          statusCode: 404,
        })
      }
    },
  )
  const inputs = computed(() => {
    const analysisVal = toValue(analysis)
    if (analysisVal && analysisVal?.analysis_inputs) {
      return analysisVal.analysis_inputs.map((input): Input => {
        return {
          ...input.datasets,
          state: input.state,
        }
      })
    }
    return undefined
  })

  const outputs = computed(() => {
    const analysisVal = toValue(analysis)
    if (analysisVal && analysisVal?.analysis_outputs) {
      return analysisVal.analysis_outputs.map((output): Output => {
        return {
          ...output.datasets,
          state: output.state,
        }
      })
    }
    return undefined
  })

  return { inputs, outputs, analysis, refresh }
}
