<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { BreadcrumbItem, TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { h, resolveComponent } from 'vue'
import { z } from 'zod'

type Database = SupabaseTypes.Database

const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})
definePageMeta({
  middleware: 'auth',
})
const filterInput = useTemplateRef('filterInput')

defineShortcuts({
  '/': () => {
    filterInput.value?.inputRef?.focus()
  },
})

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const { breadcrumbsItems } = toRefs(props)
const table = useTemplateRef('table')
const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
})
const pageSizeOptions = ref([1, 5, 10, 15])
const globalFilter = ref('')

const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const uploadingFile = ref(false)
const ColumnTableSort = resolveComponent('ColumnTableSort')
const schema = z.object({
  file: z.any(),
})

const fileMetadataSchema = z.object({
  size: z.number(),
})

type Schema = z.output<typeof schema>
type DatasetColumn = Database['galaxy']['Tables']['datasets']['Row']
const state = reactive<Partial<Schema>>({
  file: undefined,
})

const { data, refresh: refreshDatasets } = await useAsyncData<DatasetColumn[] | null | undefined>(
  'analysis-input-datasets',
  async () => {
    const userVal = toValue(user)
    if (userVal) {
      const { data } = await supabase
        .schema('galaxy')
        .from('uploaded_datasets')
        .select()
        .returns<DatasetColumn[]>()
      return data
    }
  },
)

const { data: storageObjects, refresh: refreshStorageObjects }
  = await useAsyncData('storage-objects', async () => {
    const userVal = toValue(user)
    if (userVal) {
      const { data } = await supabase
        .schema('storage')
        .from('objects')
        .select()
      return data
    }
  })

async function uploadFile(event: any) {
  const selectedFile = event.target.files?.[0]
  const userVal = toValue(user)

  if (selectedFile && userVal) {
    uploadingFile.value = true
    const { data: uploadedFile, error: uploadError } = await supabase.storage
      .from('analysis_files')
      .upload(`${crypto.randomUUID()}/${selectedFile.name}`, selectedFile)

    if (uploadError) {
      uploadingFile.value = false
      throw createError(
        'There was an error uploading the file. Please try again.',
      )
    }
    else {
      uploadingFile.value = false
      refreshDatasets()
      refreshStorageObjects()
      state.file = undefined
    }
    if (uploadedFile) {
      await supabase
        .schema('galaxy')
        .from('uploaded_datasets')
        .insert({
          owner_id: userVal.id,
          storage_object_id: uploadedFile.id,
          name: selectedFile.name,
        })
        .select()
      refreshDatasets()
    }
  }
}

const storageObjectsMap = computed(() => {
  const storageObjectsVal = toValue(storageObjects)
  if (storageObjectsVal) {
    return new Map(
      storageObjectsVal.map((ob) => {
        return [ob.id, ob]
      }),
    )
  }
  return undefined
})

interface Dataset {
  name: string | null | undefined
  size?: string | undefined
  rawSize?: number | undefined
}

const datasets = computed<Dataset[] | undefined>(() => {
  const dataVal = toValue(data)
  const storageObjectsMapVal = toValue(storageObjectsMap)
  if (dataVal) {
    return dataVal.map((d) => {
      let size: string | undefined
      let rawSize: number | undefined
      let name: string | null | undefined
      if (
        storageObjectsMapVal
        && storageObjectsMapVal.has(d.storage_object_id)
      ) {
        name = storageObjectsMapVal.get(d.storage_object_id)?.name
        const metadata = fileMetadataSchema.passthrough().parse(storageObjectsMapVal.get(
          d.storage_object_id,
        )?.metadata)
        rawSize = metadata.size
        if (rawSize) {
          const { fileSize } = useFileSize(rawSize)
          size = toValue(fileSize)
        }
      }
      return {
        name,
        size,
        rawSize,
      }
    })
  }
  return undefined
})

const columns = ref<TableColumn<Dataset>[]>([
  {
    accessorKey: 'name',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return h(ColumnTableSort, { column, label: 'Name' })
    },
  },
  {
    accessorKey: 'rawSize',
    sortingFn: 'basic',
    header: ({ column }) => {
      return h(ColumnTableSort, { column, label: 'Size' })
    },
  },
])

const pageHeaderProps = computed(() => {
  return {
    title: 'Datasets',
    description: 'From here you can upload a dataset and have the list of all the datasets available.',
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
      icon="i-lucide-files"
    />

    <div class="grid grid-flow-row auto-rows-max gap-6 mt-6">
      <div>
        <USeparator icon="lucide:upload" />
        <div class="py-3">
          <UForm
            :schema="schema"
            :state="state"
          >
            <UFormField
              label="Upload a dataset"
              name="file"
              required
              class="text-lg"
              size="xl"
            >
              <UInput
                v-model="state.file"
                type="file"
                icon="i-lucide:paperclip"
                :disabled="uploadingFile"
                :loading="uploadingFile"
                @change="uploadFile"
              />
            </UFormField>
          </UForm>
        </div>
      </div>
      <div v-if="datasets" class="mt-5">
        <USeparator icon="i-lucide:file" />
        <div class="py-3">
          <h2 class="text-lg font-bold mb-2">
            Datasets
          </h2>
          <!-- <h2 class="text-xl font-bold mb-3 mt-4">Datasets</h2> -->
          <UCard :ui="{ body: 'p-0 sm:p-0' }" class="mb-4">
            <div class="w-full space-y-4 pb-4">
              <div class="flex p-3 w-full">
                <UInput ref="filterInput" v-model="globalFilter" size="lg" icon="lucide:filter" class="w-full" placeholder="Filter...">
                  <template #trailing>
                    <template v-if="globalFilter?.length">
                      <UButton
                        color="neutral"
                        variant="link"

                        icon="lucide:circle-x"
                        aria-label="Clear input"
                        @click="globalFilter = ''"
                      />
                    </template>
                    <template v-else>
                      <UKbd value="/" />
                    </template>
                  </template>
                </UInput>
              </div>
              <UTable
                ref="table"
                v-model:pagination="pagination"
                v-model:global-filter="globalFilter"
                :data="datasets"
                :columns
                :pagination-options="{
                  getPaginationRowModel: getPaginationRowModel(),
                }"
                class="flex"
              >
                <template #rawSize-cell="{ row }">
                  <UBadge :label="row.original.size" variant="soft" />
                </template>
              </UTable>
              <div class="flex justify-center border-t border-[var(--ui-border)] pt-4 gap-2">
                <UPagination
                  :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                  :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                  :total="table?.tableApi?.getFilteredRowModel().rows.length"
                  @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
                />
                <USelect v-model="pagination.pageSize" :items="pageSizeOptions" variant="soft" @update:model-value="(s) => table?.tableApi.setPageSize(s)" />
              </div>
            </div>
          </UCard>
          <div class="flex my-2 py-3 justify-end">
            <UPageCard
              title="Run a workflow"
              description="Select a workflow and run it with one of the datasets listed above."
              icon="tabler:square-rounded-arrow-right"
              to="/workflows"
              variant="soft"
              class="w-64"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
