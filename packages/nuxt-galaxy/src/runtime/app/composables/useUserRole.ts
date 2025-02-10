import type { SupabaseClient } from '@supabase/supabase-js'
import type { JwtPayload } from 'jwt-decode'
import type { Ref } from 'vue'
import type { Database } from '../../types/database'
import type { RoleType } from '../../types/nuxt-galaxy'
import { useJwt } from '@vueuse/integrations/useJwt'
import { ref, toValue } from 'vue'

interface JwtPayloadWithRole extends JwtPayload {
  user_role: RoleType
}

export function useUserRole(supabase: SupabaseClient<Database>): { userRole: Ref<string | undefined> } {
  const userRole = ref<string | undefined>(undefined)
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      const { payload } = useJwt(session.access_token)
      const payloadVal = toValue(payload) as JwtPayloadWithRole | null
      userRole.value = payloadVal?.user_role
    }
  })

  return { userRole }
}
