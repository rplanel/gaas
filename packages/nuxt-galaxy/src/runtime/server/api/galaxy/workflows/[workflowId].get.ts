import type { GalaxyClient } from 'blendtype'
import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const workflowId = getRouterParam(event, 'workflowId')
  if (workflowId) {
    const $galaxy: GalaxyClient = event.context?.galaxy
    return $galaxy.workflows().getWorkflow(workflowId)
  }
})
