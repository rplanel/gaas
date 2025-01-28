import type { WorkflowToolStep } from 'blendtype'
import { computed, type MaybeRef, toValue } from '#imports'

interface GalaxyWorkflowStepsParams {
  workflowToolSteps: MaybeRef<Record<string, WorkflowToolStep>>
}

export function useGalaxyWorkflowSteps({ workflowToolSteps }: GalaxyWorkflowStepsParams) {
  const stepToTool = computed(() => {
    const workflowToolStepsVal = toValue(workflowToolSteps)
    const stepToToolMap: Record<string, string> = {}

    for (const stepId in workflowToolStepsVal) {
      const step = workflowToolStepsVal[stepId]
      const { tool_id: toolId } = step
      stepToToolMap[stepId] = toolId
    }
    return stepToToolMap
  })

  return { stepToTool }
}
