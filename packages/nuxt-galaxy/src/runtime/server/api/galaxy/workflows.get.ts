import type { GalaxyClient } from 'blendtype'

import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const $galaxy: GalaxyClient = event.context?.galaxy
  if ($galaxy) {
    return await $galaxy.workflows().getWorkflows()
  }
  else {
    throw createError({ statusCode: 500, statusMessage: 'Could not get the list of workflows on Galaxy server' })
  }
})