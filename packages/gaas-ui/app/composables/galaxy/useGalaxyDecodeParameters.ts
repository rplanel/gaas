import type { WorkflowConditionalParametersValue, WorkflowToolParameters } from 'blendtype'
import type { ComputedRef, MaybeRef } from 'vue'
import type { EncodedGalaxyWorkflowParameter } from './useGalaxyEncodeParameters'
import { computed, toValue } from 'vue'

export interface WorkflowParametersModel {
  [stepId: string]: WorkflowToolParameters
}

// export interface WorkflowParametersTool {
//   [paramName: string]: WorkflowParameterValue
// }

// export interface WorkflowConditionalParametersValue {
//   [paramName: string]: WorkflowParameterValue
// }

// export type WorkflowParameterValue = string | string[] | WorkflowConditionalParametersValue

export function useGalaxyDecodeParameters(galaxyWorkflowParameters: MaybeRef<EncodedGalaxyWorkflowParameter>): { decodedParameters: ComputedRef<WorkflowParametersModel | undefined> } {
  const decodedParameters = computed<WorkflowParametersModel | undefined>(() => {
    const galaxyWorkflowParametersVal = toValue(galaxyWorkflowParameters)
    if (galaxyWorkflowParametersVal) {
      const inputParameters: WorkflowParametersModel = {}
      for (const stepId in galaxyWorkflowParametersVal) {
        inputParameters[stepId] = {}

        for (const paramName in galaxyWorkflowParametersVal[stepId]) {
          const splittedParamName = paramName.split('|')
          if (splittedParamName.length === 1 && galaxyWorkflowParametersVal[stepId][paramName]) {
            inputParameters[stepId][paramName]
              = galaxyWorkflowParametersVal[stepId][paramName]
          }
          else {
            // init object
            const parentParam = splittedParamName.slice(0, -1)
            const childParam = splittedParamName.slice(-1)

            let currParamVisit: WorkflowToolParameters | WorkflowConditionalParametersValue = inputParameters[stepId]

            // we are creating the object structure.
            // each parent param should correspond to a WorkflowConditionalParametersValue type

            for (const param of parentParam) {
              if (!currParamVisit?.[param]) {
                inputParameters[stepId][param] = {}
              }
              currParamVisit = inputParameters[stepId][param] as WorkflowConditionalParametersValue || {}
            }
            if (childParam.length >= 1 && childParam[0] && galaxyWorkflowParametersVal[stepId][paramName]) {
              currParamVisit[childParam[0]]
              = galaxyWorkflowParametersVal[stepId][paramName]
            }
          }
        }
      }
      return inputParameters
    }
  })
  return { decodedParameters }
}
