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
import { useOffsetPagination } from '@vueuse/core'
// import { getErrorMessage, getStatusCode } from 'blendtype'
import { toValue } from 'vue'

type Database = SupabaseTypes.Database

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})
const table = useTemplateRef('table')
const page = ref(1)
const pageSize = ref(8)
const pageSizeOptions = ref([3, 8, 15])
const globalFilter = ref(undefined)

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
  { header: 'Workflow', accessorKey: 'workflows' },
  {
    id: 'actions',
  },
])

// const router = useRouter()

const { data: analyses, refresh: refreshAnalyses } = await useAsyncData(
  'analyses',
  async () => {
    const userVal = toValue(user)

    if (userVal === null) {
      throw createError({
        statusMessage: 'User not found',
        statusCode: 404,
      })
    }

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
  },
)

const sanitizedAnalyses = computed<SanitizedAnalysis[]>(() => {
  const analysesVal = toValue(analyses)
  if (analysesVal && Array.isArray(analysesVal)) {
    return analysesVal?.map((a) => {
      const { id, name, state, is_sync } = a
      return {
        id,
        name,
        state,
        is_sync,
        workflows: a.workflows.name,
      }
    })
  }
  return []
})

// const filteredAnalyses = computed(() => {
//   const tableVal = toValue(table)
//   if (tableVal) {
//     const rowModel = tableVal.tableApi.getFilteredRowModel().rowsById
//     console.log(t)
//   }
//   return toValue(slicedData)
// })

const slicedData = ref<SanitizedAnalysis[]>([])

function sliceData({ currentPage, currentPageSize }: { currentPage: number, currentPageSize: number }) {
  const start = (currentPage - 1) * currentPageSize
  const end = start + pageSize.value
  slicedData.value = sanitizedAnalyses.value.slice(start, end)
}
sliceData({
  currentPage: page.value,
  currentPageSize: pageSize.value,
})
const {
  currentPage,
  currentPageSize,
} = useOffsetPagination({
  total: sanitizedAnalyses.value.length,
  page,
  pageSize,
  onPageChange: sliceData,
  onPageSizeChange: sliceData,
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

const pageHeaderProps = computed(() => {
  return {
    title: 'Analysis',
    description: 'All analyses that has been run',
    ui: {
      root: 'relative border-b-0 border-[var(--ui-border)] py-8',
    },

  }
})
</script>

<template>
  <div>
    <PageHeader
      :page-header-props
      :breadcrumbs-items="breadcrumbsItems"
      icon="i-streamline:code-analysis"
    >
      <template #trailing-content>
        <UButton icon="i-mdi:plus" to="/workflows" size="xl" />
      </template>
    </PageHeader>

    <div class="flex flex-col flex-1 w-full ring ring-[var(--ui-border)] rounded-[calc(var(--ui-radius)*2)] my-3">
      <!-- <div class="flex px-4 py-3.5 border-b border-[var(--ui-border-accented)]">
        <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />
      </div> -->
      <UTable ref="table" v-model:global-filter="globalFilter" :data="slicedData" :columns="galaxyAnalysesColumns">
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
              trailing-icon="i-lucide-arrow-right" :to="`/analyses/${row.original.id}/results`" color="neutral"
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
                icon="i-mdi:refresh" :to="`/analyses/${row.original.id}/rerun`" variant="ghost"
                color="neutral" size="md"
              />
            </div>
            <div>
              <UButton
                icon="i-lucide:pencil" variant="ghost" color="neutral" size="md"
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
    </div>
    <div class="flex justify-center p-3 m-2 gap-1">
      <UPagination v-model:page="currentPage" :items-per-page="currentPageSize" :total="sanitizedAnalyses.length" variant="soft" />
      <USelect v-model="pageSize" :items="pageSizeOptions" variant="soft" />
    </div>
  </div>
</template>
