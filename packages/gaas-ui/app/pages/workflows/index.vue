<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { BreadcrumbItem } from '@nuxt/ui'
import {
  definePageMeta,
  useAsyncData,
  useSupabaseClient,
  useSupabaseUser,
} from '#imports'
import { galaxyWorkflowExportSchema, getErrorMessage, getStatusCode } from 'blendtype'
import { toValue } from 'vue'
import { z } from 'zod'
import { fromError } from 'zod-validation-error'

type Database = SupabaseTypes.Database
interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})
const { breadcrumbsItems } = toRefs(props)
definePageMeta({
  middleware: 'auth',
})

// const router = useRouter()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

type WorkflowDbItem = Pick<
  Database['galaxy']['Tables']['workflows']['Row'],
  'id' | 'name' | 'galaxy_id' | 'version' | 'definition'
>

// async function resetError(error: Ref<null | unknown >) {
//   await router.push('/')
//   error.value = null
// }

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

const sanitizedDbWorkflows = computed(() => {
  const dbWorkflowsVal = toValue(dbWorkflows)
  if (dbWorkflowsVal) {
    return dbWorkflowsVal.map((wf) => {
      try {
        const definition = galaxyWorkflowExportSchema.passthrough().parse(wf.definition)
        return { ...wf, definition }
      }
      catch (err) {
        if (err instanceof z.ZodError) {
          const sanitizedErr = fromError(err)

          throw createError({ statusMessage: sanitizedErr.message, cause: sanitizedErr.cause, stack: sanitizedErr.stack, name: sanitizedErr.name })
        }
        throw createError({
          statusCode: getStatusCode(err),
          statusMessage: getErrorMessage(err),
        })
      }
    })
  }
  return null
})

const pageHeaderProps = computed(() => {
  return {
    title: 'Workflows',
    description: 'Select a workflow in order to run your analysis',
  }
})
</script>

<template>
  <div>
    <PageHeader
      :page-header-props
      icon="i-lucide:workflow"
      :breadcrumbs-items="breadcrumbsItems"
    />

    <div class="grid grid-flow-row auto-rows-max gap-6 my-3">
      <div>
        <div v-if="dbWorkflows" class="grid grid-flow-row auto-rows-max">
          <UPageList divide>
            <UPageCard
              v-for="(workflow) in sanitizedDbWorkflows"
              :key="workflow.id"
              orientation="horizontal"
              variant="ghost"
              icon="tabler:square-rounded-arrow-right"
              :to="`/workflows/${workflow.id}/run`"
              :title="workflow.name"
              :description=" workflow.definition.annotation"

              :ui="{ container: 'lg:grid-cols-1' }"
            >
              <template #footer>
                <VersionBadge :version="workflow.version.toString()" variant="soft" />
              </template>

              <!-- <template #body>
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
                            <div v-if="workflow?.definition">
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
                    </template> -->
            </UPageCard>

            <!-- <UCard class="my-2 hoverWorkflow" @click="runWorkflowPage(workflow.id)">
                  </UCard> -->
          </UPageList>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hoverWorkflow:hover {
  background-color: var(--ui-bg-accented);
  cursor: pointer;
}
</style>
