import { createError, useRuntimeConfig } from '#imports'
import { parseURL } from 'ufo'
import { computed, toValue } from 'vue'

export function useSupabaseCookie() {
  const { public: { supabase: { url } } } = useRuntimeConfig()
  const { host } = parseURL(url)
  const authCookieName = computed(() => {
    if (host) {
      const subdomain = host.split('.')[0]
      return `sb-${subdomain}-auth-token`
    }
    throw createError('useSupabaseCookie: host is not defined')
  })

  return { authCookieName: toValue(authCookieName) }
}
