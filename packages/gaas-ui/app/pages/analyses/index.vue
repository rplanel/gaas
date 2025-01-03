<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { BreadcrumbItem, TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import {
  definePageMeta,
  useAsyncData,
  useSupabaseClient,
  useSupabaseUser,
} from '#imports'
// import { getErrorMessage, getStatusCode } from 'blendtype'
import { toValue } from 'vue'

type Database = SupabaseTypes.Database

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})
const { breadcrumbsItems } = toRefs(props)
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toast = useToast()
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')
type Analysis = Pick<
  Database['galaxy']['Tables']['analyses']['Row'],
  'id' | 'name' | 'state' | 'is_sync'
>
interface AnalysisWithWorkflow extends Analysis {
  workflows: Database['galaxy']['Tables']['workflows']['Row']
  histories: Pick<
    Database['galaxy']['Tables']['histories']['Row'],
    'state' | 'is_sync'
  >
}

interface SanitizedAnalysis extends Analysis {
  workflows: string
}

definePageMeta({
  middleware: 'auth',
})

const isEditingAnalyses = ref<Record<number, string>>({})

const galaxyAnalysesColumns = ref<TableColumn<SanitizedAnalysis>[]>([
  {
    accessorKey: 'name',
    header: 'Name',
  },
  { header: 'State', accessorKey: 'histories.state', id: 'historiesState' },
  { header: 'Workflow', accessorKey: 'workflows.name' },
  {
    id: 'actions',
  },
])

const router = useRouter()

const { data: analyses, refresh: refreshAnalyses } = await useAsyncData(
  'analyses',
  async () => {
    const userVal = toValue(user)
    if (userVal) {
      const { data, error } = await supabase
        .schema('galaxy')
        .from('analyses')
        .select(
          `
        id,
        name,
        state,
        workflows(*),
        histories(state, is_sync)
        `,
        )
        .order('id', { ascending: true })
        .returns<AnalysisWithWorkflow[]>()
      if (error) {
        throw createError({
          statusMessage: error.message,
          statusCode: Number.parseInt(error.code),
        })
      }
      return data
    }
    return false
  },
)

const sanitizedAnalyses = computed<AnalysisWithWorkflow[]>(() => {
  const analysesVal = toValue(analyses)
  if (analysesVal && Array.isArray(analysesVal)) {
    return analysesVal?.map(a => ({
      ...a,
    }))
  }
  return []
})

function handleUpdates() {
  refreshAnalyses()
}

// Listen to inserts
supabase
  .channel('analyses')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'galaxy', table: 'analyses' },
    handleUpdates,
  )
  .subscribe()

async function resetError(error: Ref<unknown>) {
  error.value = null

  await router.push('/analyses')
}
async function deleteItem(item: SanitizedAnalysis) {
  try {
    await $fetch(`/api/db/analyses/${item.id}`, { method: 'DELETE' })
    refreshAnalyses()
  }
  catch (error) {
    const { errorMessage } = useErrorMessage(error)
    const { errorStatus } = useErrorStatus(error)

    throw createError({
      message: toValue(errorMessage),
      statusCode: toValue(errorStatus),
    })
  }
}

function getRowItems(row: Row<SanitizedAnalysis>) {
  return [
    {
      type: 'label',
      label: 'Actions',
    },
    {
      type: 'separator',
    },
    {
      label: 'Delete',
      icon: 'i-mdi:delete',
      color: 'error',

      onSelect() {
        deleteItem(row.original)

        toast.add({
          title: 'Analysis deleted',
          color: 'success',
          icon: 'i-lucide-circle-check',
        })
      },
    },
  ]
}

function setEditState(id: number, name: string) {
  const isEditingAnalysesVal = toValue(isEditingAnalyses)
  isEditingAnalysesVal[id] = name
}

function resetEditAnalysis(id: number) {
  const isEditingAnalysesVal = toValue(isEditingAnalyses)
  if (isEditingAnalysesVal?.[id]) {
    const { [id]: toRemove, ...rest } = isEditingAnalysesVal
    isEditingAnalyses.value = rest
  }
}

async function editAnalysisName(id: number) {
  const isEditingAnalysesVal = toValue(isEditingAnalyses)
  if (isEditingAnalysesVal?.[id]) {
    const name = isEditingAnalysesVal[id]
    const { error } = await supabase
      .schema('galaxy')
      .from('analyses')
      .update({ name })
      .eq('id', id)
      .select()
    if (error) {
      const { errorMessage } = useErrorMessage(error)
      const { errorStatus } = useErrorStatus(error)
      throw createError({
        statusCode: toValue(errorStatus),
        statusMessage: toValue(errorMessage),
      })
    }
    const { [id]: toRemove, ...rest } = isEditingAnalyses.value
    isEditingAnalyses.value = rest
  }
}

await useFetch('/sync')
</script>

<template>
  <div>
    <NuxtErrorBoundary>
      <PageHeader
        title="Analysis" description="All analyses that has been run" icon="i-streamline:code-analysis"
        :breadcrumbs-items="breadcrumbsItems"
      >
        <template #trailing-content>
          <UButton icon="i-mdi:plus" to="/workflows" size="xl" />
        </template>
      </PageHeader>
      <UTable :data="sanitizedAnalyses" :columns="galaxyAnalysesColumns">
        <template #name-cell="{ row }">
          <div
            v-if="isEditingAnalyses?.[row.original.id]"
            class="grid grid-flow-col-dense auto-cols-max gap-0.5 justify-start w-full"
          >
            <div class="self-center w-full flex-1">
              <UInput
                v-if="isEditingAnalyses?.[row.original.id]" v-model="isEditingAnalyses[row.original.id]"
                label="Analysis Name" class=""
              />
            </div>
            <div class="self-center flex-none">
              <UButton
                color="success" variant="ghost" size="sm" icon="i-lucide:check"
                @click="editAnalysisName(row.original.id)"
              />
            </div>
            <div class="self-center flex-none">
              <UButton
                color="warning" variant="ghost" size="sm" icon="i-mdi:cancel"
                @click="resetEditAnalysis(row.original.id)"
              />
            </div>
          </div>
          <div v-else>
            <UButton
              trailing-icon="i-lucide-arrow-right" :to="`/analyses/${row.original.id}`" color="neutral"
              variant="ghost"
            >
              <span class="font-bold">{{ row.original.name }}</span>
            </UButton>
          </div>
        </template>
        <template #historiesState-cell="{ row }">
          <GalaxyStatus :state="row.original.state" />
        </template>
        <template #actions-cell="{ row }">
          <div class="grid grid-flow-col gap-1 justify-start">
            <div>
              <UButton
                icon="i-mdi:refresh" :to="`/analyses/${row.original.id}/rerun`" variant="outline"
                color="neutral" size="md"
              />
            </div>
            <div>
              <UButton
                icon="i-lucide:pencil" variant="outline" color="neutral" size="md"
                @click="setEditState(row.original.id, row.original.name)"
              />
            </div>
            <div>
              <UDropdownMenu :content="{ content: { align: 'end' } }" :items="getRowItems(row)">
                <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" class="ml-auto" />
              </UDropdownMenu>
            </div>
          </div>
        </template>
      </UTable>

      <template #error="{ error }">
        <UAlert
          color="error" variant="soft" title="Error" :description="error" icon="i-material-symbols:error"
          :actions="[
            {
              label: 'List Analyses',
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
