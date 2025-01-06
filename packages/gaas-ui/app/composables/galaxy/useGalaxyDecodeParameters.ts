import type { EncodedGalaxyWorkflowParameter } from './useGalaxyEncodeParameters'

export interface WorkflowParametersModel {
  [stepId: string]: WorkflowParametersTool
}

export interface WorkflowParametersTool {
  [paramName: string]: string | string[] | WorkflowConditionalParametersValue
}

export interface WorkflowConditionalParametersValue {
  [paramName: string]: WorkflowParameterValue
}

export type WorkflowParameterValue = string | string[] | WorkflowConditionalParametersValue

export function useGalaxyDecodeParameters(galaxyWorkflowParameters: MaybeRef<EncodedGalaxyWorkflowParameter>): { decodedParameters: ComputedRef<WorkflowParametersModel | undefined> } {
  const decodedParameters = computed<WorkflowParametersModel | undefined>(() => {
    const galaxyWorkflowParametersVal = toValue(galaxyWorkflowParameters)
    if (galaxyWorkflowParametersVal) {
      const inputParameters: WorkflowParametersModel = {}
      for (const stepId in galaxyWorkflowParametersVal) {
        inputParameters[stepId] = {}

        for (const paramName in galaxyWorkflowParametersVal[stepId]) {
          const splittedParamName = paramName.split('|')
          if (splittedParamName.length === 1) {
            inputParameters[stepId][paramName]
              = galaxyWorkflowParametersVal[stepId][paramName]
          }
          else {
            // init object
            const parentParam = splittedParamName.slice(0, -1)
            const childParam = splittedParamName.slice(-1)

            let currParamVisit = inputParameters[stepId]
            for (const param of parentParam) {
              if (!currParamVisit?.[param]) {
                inputParameters[stepId][param] = {}
              }
              currParamVisit = inputParameters[stepId][param]
            }
            currParamVisit[childParam[0]]
              = galaxyWorkflowParametersVal[stepId][paramName]
          }
        }
      }
      return inputParameters
    }
  })

  return { decodedParameters }
}
