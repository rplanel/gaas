import type { SupabaseTypes } from '#build/types/database'
import type { GalaxyTypes } from '#build/types/nuxt-galaxy'
import type { SupabaseClient } from '@supabase/supabase-js'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { ref } from 'vue'

interface JwtPayloadWithRole extends JwtPayload {
  user_role: GalaxyTypes.RoleType
}

export function useUserRole(supabase: SupabaseClient<SupabaseTypes.Database>): { userRole: Ref<string | undefined> } {
  const userRole = ref<string | undefined>(undefined)
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      const jwt = jwtDecode<JwtPayloadWithRole>(session.access_token)
      userRole.value = jwt?.user_role
    }
  })

  return { userRole }
}
