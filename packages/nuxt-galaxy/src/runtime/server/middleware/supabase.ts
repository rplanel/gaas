import type { Database } from '../../types/database'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { defineEventHandler, parseCookies } from 'h3'
import { useSupabaseCookie } from '../../app/composables/useSupabaseCookie'

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event)
  const { authCookieName } = useSupabaseCookie()
  if (cookies[authCookieName]) {
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient<Database>(event)
    event.context.supabase = { user, client }
  }
})
