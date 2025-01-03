<script setup lang="ts">
import type { Database } from '#build/types/database'
import type { RoleType } from '#build/types/nuxt-galaxy'
import type { BreadcrumbItem } from '@nuxt/ui'
import {
  definePageMeta,
  ref,
  useAsyncData,
  useRouter,
  useSupabaseClient,
  useSupabaseUser,
} from '#imports'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { toValue } from 'vue'

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})
const { breadcrumbsItems } = toRefs(props)
const router = useRouter()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

type WorkflowDbItem = Pick<
  Database['galaxy']['Tables']['workflows']['Row'],
  'id' | 'name' | 'galaxy_id' | 'version' | 'definition'
>

interface JwtPayloadWithRole extends JwtPayload {
  user_role: RoleType
}

const userRole = ref<string | undefined>(undefined)
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    const jwt = jwtDecode<JwtPayloadWithRole>(session.access_token)
    userRole.value = jwt?.user_role
  }
})

// const breadcrumbsItems = ref([
//   {
//     label: 'Home',
//     disabled: false,
//     to: '/',
//   },
//   {
//     label: 'Workflows',
//     disabled: true,
//     to: '/workflows',
//   },
// ])

function runWorkflowPage(workflowId: number) {
  router.push(`/workflows/${workflowId}/run`)
}

async function resetError(error: Ref<null | unknown >) {
  await router.push('/workflows')
  error.value = null
}

const { data: dbWorkflows } = await useAsyncData('workflows-auth', async () => {
  const userVal = toValue(user)
  if (userVal) {
    const { data } = await supabase
      .schema('galaxy')
      .from('workflows')
      .select('id, name, galaxy_id, version, definition')
      .returns<WorkflowDbItem[]>()
    return data
  }
})

definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div>
    <NuxtErrorBoundary>
      <PageHeader
        title="Workflows" description="All the workflow available either on this web app or in the galaxy
              instance" icon="i-lucide:workflow" :breadcrumbs-items="breadcrumbsItems"
      />

      <div class="grid grid-flow-row auto-rows-max gap-6">
        <div>
          <!-- <h2 class="text-xl font-bold mb-2 mt-4">Web application</h2> -->
          <div v-if="dbWorkflows" class="grid grid-flow-row auto-rows-max">
            <div v-for="(workflow, i) in dbWorkflows" :key="workflow.id">
              <UCard class="my-2 hoverWorkflow" @click="runWorkflowPage(workflow.id)">
                <div>
                  <div class="grid grid-flow-col auto-cols-max items-center justify-between">
                    <div class="grid grid-flow-col auto-cols-max items-center place-items-start">
                      <span class="mr-3">
                        <UAvatar :text="String(i + 1)" />
                      </span>
                      <div class="grid grid-flow-row auto-rows-max">
                        <div>
                          <span class="font-bold text-lg">{{
                            workflow.name
                          }}</span>
                        </div>
                        <div>
                          <span class="font-medium text-sm opacity-60">{{
                            workflow.definition.annotation
                          }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="place-items-end">
                      <VersionBadge :version="workflow.version.toString()" />
                    </div>
                  </div>
                </div>
                <!-- <USeparator orientation="horizontal" type="dashed" class="my-5" /> -->
              </UCard>
            </div>
          </div>
        </div>
      </div>

      <template #error="{ error }">
        <UAlert
          color="error" variant="soft" title="Error" :description="error" icon="i-material-symbols:error"
          :actions="[
            {
              label: 'go to list workfows',
              onClick(event) {
                resetError(error);
              },
            },
          ]"
        />
      </template>
    </NuxtErrorBoundary>
  </div>
</template>

<style scoped>
.hoverWorkflow:hover {
  background-color: var(--ui-bg-accented);
  cursor: pointer;
}
</style>
