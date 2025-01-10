// import { useRuntimeConfig } from '@nuxt/kit'
import type { GalaxyClient, GalaxyVersion } from 'blendtype'
import type { GalaxyInstanceDetails } from '../../../types/nuxt-galaxy'
import { useRuntimeConfig } from '#imports'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event): Promise<GalaxyInstanceDetails> => {
  const { public: { galaxy: { url } } } = useRuntimeConfig()
  const $galaxy: GalaxyClient = event.context?.galaxy
  const version: GalaxyVersion = await $galaxy.getVersion()
  return { url, ...version }
})
