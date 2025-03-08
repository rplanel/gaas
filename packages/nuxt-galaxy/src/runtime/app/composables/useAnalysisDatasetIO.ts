import type { AsyncDataExecuteOptions } from '#app/composables/asyncData'
import type { MaybeRef, Ref } from '#imports'
import type { Database } from '../../types/database'
import type { AnalysisDetail, AnalysisInputsWithStoratePath, AnalysisOutputsWithStoratePath } from '../../types/nuxt-galaxy'
import { createError, ref, toValue, useSupabaseClient, useSupabaseUser } from '#imports'

export function useAnalysisDatasetIO(analysisId: MaybeRef<number | undefined>): {
  inputs: Ref<AnalysisInputsWithStoratePath[] | null>
  outputs: Ref<AnalysisOutputsWithStoratePath[] | null>
  analysis: Ref<AnalysisDetail | null>
  refresh: (opts?: AsyncDataExecuteOptions) => void
} {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const inputs = ref<AnalysisInputsWithStoratePath[] | null>(null)
  const outputs = ref<AnalysisOutputsWithStoratePath[] | null>(null)
  const analysis = ref<AnalysisDetail | null>(null)
  // const { data: inputs } = await useAsyncData<AnalysisInputsWithStoratePath[] | null>(
  //   `analysis-inputs-${toValue(analysisId)}`,
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
  //       .from('analysis_inputs_with_storage_path')
  //       .select('*')
  //       .eq('analysis_id', analysisVal)
  //       .returns<AnalysisInputsWithStoratePath[]>()

  //     if (error) {
  //       throw createError({
  //         statusMessage: error.message,
  //         statusCode: Number.parseInt(error.code),
  //       })
  //     }
  //     if (data === null) {
  //       throw createError({ statusMessage: 'No input datasets found', statusCode: 404 })
  //     }
  //     return data
  //   },
  // )
  // const { data: outputs } = await useAsyncData<AnalysisOutputsWithStoratePath[] | null>(
  //   `analysis-outputs-${toValue(analysisId)}`,
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
  //       .from('analysis_outputs_with_storage_path')
  //       .select('*')
  //       .eq('analysis_id', analysisVal)
  //       .returns<AnalysisOutputsWithStoratePath[]>()

  //     if (error) {
  //       throw createError({
  //         statusMessage: error.message,
  //         statusCode: Number.parseInt(error.code),
  //       })
  //     }
  //     if (data === null) {
  //       throw createError({ statusMessage: 'No output datasets found', statusCode: 404 })
  //     }
  //     return data
  //   },
  // )
  // const { data: analysis, refresh } = await useAsyncData<AnalysisDetail | null>(
  //   `analysis-details-${toValue(analysisId)}`,
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
  //       .from('analyses')
  //       .select(`
  //         *,
  //         histories(*),
  //         jobs(*),
  //         workflows(*)
  //         `)
  //       .eq('id', analysisVal)
  //       .returns<AnalysisDetail[]>()

  //     if (error) {
  //       throw createError({
  //         statusMessage: error.message,
  //         statusCode: Number.parseInt(error.code),
  //       })
  //     }
  //     if (data.length === 1) {
  //       return data[0]
  //     }
  //     else {
  //       throw createError({
  //         statusMessage: 'No analysis found',
  //         statusCode: 404,
  //       })
  //     }
  //   },
  // )

  async function fetchInputs() {
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
    return inputs.value = data
  }
  async function fetchOutputs() {
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
    return outputs.value = data
  }
  async function fetchAnalysis() {
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
      return analysis.value = data[0]
    }
    else {
      throw createError({
        statusMessage: 'No analysis found',
        statusCode: 404,
      })
    }
  }
  fetchInputs()
  fetchOutputs()
  fetchAnalysis()
  return { inputs, outputs, analysis, refresh: fetchAnalysis }
}
