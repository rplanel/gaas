import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database'
import type { RoleType } from '../../types/nuxt-galaxy'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { ref, type Ref } from 'vue'

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
