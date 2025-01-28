import type { GalaxyClient } from 'blendtype'
import { createError, defineEventHandler, getRouterParam } from '#imports'
import { decode } from 'ufo'

export default defineEventHandler(async (event) => {
  const toolId = getRouterParam(event, 'toolId')
  const toolVersion = getRouterParam(event, 'toolVersion')
  if (toolId && toolVersion) {
    const $galaxy: GalaxyClient = event.context?.galaxy
    return $galaxy.tools().getTool(decode(toolId), toolVersion)
  }
  else {
    throw createError('Tool id or version missing in request')
  }
})
