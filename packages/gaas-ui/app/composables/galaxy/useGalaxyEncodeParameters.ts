import type { WorkflowParametersModel } from './useGalaxyDecodeParameters'

export type EncodedGalaxyWorkflowParameter = Record<string, Record<string, WorkflowParameterValue>>

export type WorkflowParameterValue =
  | string
  | string[]
  | Record<string | number, WorkflowParameterConditionalValue>

interface WorkflowParameterConditionalValue {
  [key: string]: WorkflowParameterValue
}

export function useGalaxyEncodeParameters(parameterModel: MaybeRef<WorkflowParametersModel>): { encodedParameters: ComputedRef<EncodedGalaxyWorkflowParameter> } {
  const encodedParameters = computed<EncodedGalaxyWorkflowParameter>(() => {
    const parametersVal = toValue(parameterModel)
    const parameters: Record<string, Record<string, WorkflowParameterValue | undefined>> = {}
    if (parametersVal) {
      for (const [stepId, params] of Object.entries(parametersVal)) {
        parameters[stepId] = {}
        for (const [key, param] of Object.entries(params)) {
          if (typeof param === 'object' && !Array.isArray(param)) {
            for (const paramKey in param) {
              parameters[stepId][`${key}|${paramKey}`] = param[paramKey]
            }
          }
          else {
            parameters[stepId][key] = param
          }
        }
      }
    }
    return parameters
  })

  return { encodedParameters }
}
