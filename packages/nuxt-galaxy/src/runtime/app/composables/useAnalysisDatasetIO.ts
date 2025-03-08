import type { AsyncDataExecuteOptions } from '#app/composables/asyncData'
import type { MaybeRef, Ref } from '#imports'
import type { Database } from '../../types/database'
import type { AnalysisDetail, AnalysisInputsWithStoratePath, AnalysisOutputsWithStoratePath } from '../../types/nuxt-galaxy'
import { createError, toValue, useAsyncData, useSupabaseClient, useSupabaseUser } from '#imports'

export async function useAnalysisDatasetIO(analysisId: MaybeRef<number | undefined>): Promise<{
  inputs: Ref<AnalysisInputsWithStoratePath[] | null>
  outputs: Ref<AnalysisOutputsWithStoratePath[] | null>
  analysis: Ref<AnalysisDetail | null>
  // jobs: Ref<AnalysisJobs[] | null>
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>
}> {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // const { data: jobs } = await useAsyncData(
  //   `analysis-jobd-${toValue(analysisId)}`,
  //   async () => {
  //     const analysisVal = toValue(analysisId)
  //     const userVal = toValue(user)
  //     if (!userVal) {
  //       throw createError({
  //         statusCode: 401,
  //         statusMessage: 'Unauthorized: User not found',
  //       })
  //     }
  //     if (!analysisVal) {
  //       throw createError({
  //         statusCode: 404,
  //         statusMessage: 'Analysis not found',
  //       })
  //     }
  //     const { data, error } = await supabase
  //       .schema('galaxy')
  //       .from('jobs')
  //       .select('*, analysis(*)')
  //       .eq('analysis_id', analysisVal)
  //       .returns<AnalysisJobs[]>()

  //     if (error) {
  //       throw createError({
  //         statusMessage: error.message,
  //         statusCode: Number.parseInt(error.code),
  //       })
  //     }
  //     return data
  //   },
  // )
  const { data: inputs } = await useAsyncData<AnalysisInputsWithStoratePath[] | null>(
    `analysis-inputs-${toValue(analysisId)}`,
    async () => {
      const analysisVal = toValue(analysisId)
      const userVal = toValue(user)
      if (!userVal) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized: User not found',
        })
      }
      if (!analysisVal) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Analysis not found',
        })
      }
      const { data, error } = await supabase
        .schema('galaxy')
        .from('analysis_inputs_with_storage_path')
        .select('*')
        .eq('analysis_id', analysisVal)
        .returns<AnalysisInputsWithStoratePath[]>()

      if (error) {
        throw createError({
          statusMessage: error.message,
          statusCode: Number.parseInt(error.code),
        })
      }
      if (data === null) {
        throw createError({ statusMessage: 'No input datasets found', statusCode: 404 })
      }
      return data
    },
  )
  const { data: outputs } = await useAsyncData<AnalysisOutputsWithStoratePath[] | null>(
    `analysis-outputs-${toValue(analysisId)}`,
    async () => {
      const analysisVal = toValue(analysisId)
      const userVal = toValue(user)
      if (!userVal) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized: User not found',
        })
      }
      if (!analysisVal) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Analysis not found',
        })
      }
      const { data, error } = await supabase
        .schema('galaxy')
        .from('analysis_outputs_with_storage_path')
        .select('*')
        .eq('analysis_id', analysisVal)
        .returns<AnalysisOutputsWithStoratePath[]>()

      if (error) {
        throw createError({
          statusMessage: error.message,
          statusCode: Number.parseInt(error.code),
        })
      }
      if (data === null) {
        throw createError({ statusMessage: 'No output datasets found', statusCode: 404 })
      }
      return data
    },
  )
  const { data: analysis, refresh } = await useAsyncData<AnalysisDetail | null>(
    `analysis-details-${toValue(analysisId)}`,
    async () => {
      const analysisVal = toValue(analysisId)
      const userVal = toValue(user)

      if (!userVal) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized: User not found',
        })
      }
      if (!analysisVal) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Analysis not found',
        })
      }
      const { data, error } = await supabase
        .schema('galaxy')
        .from('analyses')
        .select(`
          *,
          histories(*),
          jobs(*),
          workflows(*)
          `)
        .eq('id', analysisVal)
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

  return { inputs, outputs, analysis, refresh }
}
