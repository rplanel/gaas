import type { Database } from '#build/types/database'
import type { RoleType } from '#build/types/nuxt-galaxy'
import type { SupabaseClient } from '@supabase/supabase-js'
import { jwtDecode, type JwtPayload } from 'jwt-decode'

interface JwtPayloadWithRole extends JwtPayload {
  user_role: RoleType
}

export function useUserRole(supabase: SupabaseClient<Database>): { userRole: Ref<string | undefined> } {
  const userRole = ref<string | undefined>(undefined)
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      const jwt = jwtDecode<JwtPayloadWithRole>(session.access_token)
      userRole.value = jwt?.user_role
    }
  })

  return { userRole }
}
