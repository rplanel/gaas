<script setup lang="ts">
// import type {
//   BreadcrumbItem,
//   TableColumn,
// } from '@nuxt/ui'
import type { Database } from '../../types'

// import { ColumnTableSort } from '#components'
import {
  definePageMeta,
  useAsyncData,
  useSupabaseClient,
  useSupabaseUser,
} from '#imports'
// import { getErrorMessage, getStatusCode } from 'blendtype'
import { toValue } from 'vue'

// interface Props {
//   breadcrumbsItems?: BreadcrumbItem[] | undefined
// }
// const props = withDefaults(defineProps<Props>(), {
//   breadcrumbsItems: undefined,
// })

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
// const toast = useToast()
export type ListAnalysis = Pick<
  Database['galaxy']['Tables']['analyses']['Row'],
  'id' | 'name' | 'state' | 'is_sync'
>
export interface ListAnalysisWithWorkflow extends ListAnalysis {
  workflows: Database['galaxy']['Tables']['workflows']['Row']
  histories: Pick<
    Database['galaxy']['Tables']['histories']['Row'],
    'state' | 'is_sync'
  >
}

export interface SanitizedAnalysis extends ListAnalysis {
  workflows: string
}

definePageMeta({
  middleware: 'auth',
})

// const isEditingAnalyses = ref<Record<number, string>>({})

// const galaxyAnalysesColumns = ref<TableColumn<SanitizedAnalysis>[]>([
//   {
//     accessorKey: 'name',
//     sortingFn: 'alphanumeric',
//     header: ({ column }) => {
//       return h(ColumnTableSort, { column, label: 'Name' })
//     },
//   },
//   { header: 'State', accessorKey: 'histories.state', id: 'historiesState' },
//   {
//     accessorKey: 'workflows',
//     sortingFn: 'alphanumeric',
//     header: ({ column }) => {
//       return h(ColumnTableSort, { column, label: 'Workflow' })
//     },
//   },
//   {
//     id: 'actions',
//   },
// ])

// const router = useRouter()

const {
  // data: analyses,
  refresh: refreshAnalyses,
} = await useAsyncData(
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
      .returns<ListAnalysisWithWorkflow[]>()
    if (error) {
      throw createError({
        statusMessage: error.message,
        statusCode: Number.parseInt(error.code),
      })
    }
    return data
  },
)

// const sanitizedAnalyses = computed<SanitizedAnalysis[]>(() => {
//   const analysesVal = toValue(analyses)
//   if (analysesVal && Array.isArray(analysesVal)) {
//     return analysesVal?.map((a) => {
//       const { id, name, state, is_sync } = a
//       return {
//         id,
//         name,
//         state,
//         is_sync,
//         workflows: a.workflows.name,
//       }
//     })
//   }
//   return []
// })

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

// Listen to delete
supabase
  .channel('analyses')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'galaxy', table: 'analyses' },
    handleUpdates,
  )
  .subscribe()

// async function deleteItem(item: SanitizedAnalysis) {
//   try {
//     await $fetch(`/api/db/analyses/${item.id}`, { method: 'DELETE' })
//     // refreshAnalyses()
//     // debugger
//   }
//   catch (error) {
//     const { errorMessage } = useErrorMessage(error)
//     const { errorStatus } = useErrorStatus(error)

//     throw createError({
//       message: toValue(errorMessage),
//       statusCode: toValue(errorStatus),
//     })
//   }
// }

// function getRowItems(row: Row<SanitizedAnalysis>) {
//   return [
//     {
//       type: 'label',
//       label: 'Actions',
//     },
//     {
//       type: 'separator',
//     },
//     {
//       label: 'Delete',
//       icon: 'i-mdi:delete',
//       color: 'error',

//       onSelect() {
//         deleteItem(row.original)

//         toast.add({
//           title: 'Analysis deleted',
//           color: 'success',
//           icon: 'i-lucide-circle-check',
//         })
//       },
//     },
//   ]
// }

// function setEditState(id: number, name: string) {
//   const isEditingAnalysesVal = toValue(isEditingAnalyses)
//   isEditingAnalysesVal[id] = name
// }

// function resetEditAnalysis(id: number) {
//   const isEditingAnalysesVal = toValue(isEditingAnalyses)
//   if (isEditingAnalysesVal?.[id]) {
//     const { [id]: toRemove, ...rest } = isEditingAnalysesVal
//     isEditingAnalyses.value = rest
//   }
// }

// async function editAnalysisName(id: number) {
//   const isEditingAnalysesVal = toValue(isEditingAnalyses)
//   if (isEditingAnalysesVal?.[id]) {
//     const name = isEditingAnalysesVal[id]
//     const { error } = await supabase
//       .schema('galaxy')
//       .from('analyses')
//       .update({ name })
//       .eq('id', id)
//       .select()
//     if (error) {
//       const { errorMessage } = useErrorMessage(error)
//       const { errorStatus } = useErrorStatus(error)
//       throw createError({
//         statusCode: toValue(errorStatus),
//         statusMessage: toValue(errorMessage),
//       })
//     }
//     const { [id]: toRemove, ...rest } = isEditingAnalyses.value
//     isEditingAnalyses.value = rest
//   }
// }
await useFetch('/sync')

// const utableProps = computed(() => {
//   return {
//     columns: galaxyAnalysesColumns.value,
//     data: sanitizedAnalyses.value,
//   }
// })
</script>

<template>
  <div class="hidden lg:flex flex-1 items-center justify-center">
    <UIcon name="i-lucide:workflow" class="size-32 text-(--ui-text-dimmed)" />
  </div>
  <!-- <div>
    <PageHeader
      :page-header-props
      :breadcrumbs-items="breadcrumbsItems"
      icon="i-streamline:code-analysis"
    >
      <template #trailing-content>
        <UButton icon="i-mdi:plus" to="/workflows" size="xl" />
      </template>
    </PageHeader>

    <TableGeneric
      :utable-props
    >
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
            trailing-icon="tabler:square-rounded-arrow-right" :to="`/analyses/${row.original.id}/results`" color="neutral"
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
    </TableGeneric>
  </div> -->
</template>
