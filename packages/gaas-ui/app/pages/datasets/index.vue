<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { BreadcrumbItem, TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import { z } from 'zod'

type Database = SupabaseTypes.Database

const props = withDefaults(defineProps<Props>(), {
  breadcrumbsItems: undefined,
})
definePageMeta({
  middleware: 'auth',
})

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const { breadcrumbsItems } = toRefs(props)
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
type DatasetColumn = Database['galaxy']['Views']['uploaded_datasets_with_storage_path']['Row']
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
        .from(`uploaded_datasets_with_storage_path`)
        .select()
        .returns<DatasetColumn[]>()
      return data
    }
  },
)

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
      state.file = undefined
    }
    if (uploadedFile) {
      await supabase
        .schema('galaxy')
        .from('uploaded_datasets')
        .insert({
          owner_id: userVal.id,
          storage_object_id: uploadedFile.id,
          dataset_name: selectedFile.name,
        })
        .select()
      refreshDatasets()
    }
  }
}

interface Dataset {
  name: string | null | undefined
  size?: string | undefined
  rawSize?: number | undefined
}

const datasets = computed<Dataset[] | undefined>(() => {
  const dataVal = toValue(data)
  // const storageObjectsMapVal = toValue(storageObjectsMap)
  if (dataVal) {
    return dataVal.map((d) => {
      let size: string | undefined
      const name = d.dataset_name
      const metadata = fileMetadataSchema.passthrough().parse(d.metadata)
      const rawSize = metadata.size
      if (rawSize) {
        const { fileSize } = useFileSize(rawSize)
        size = toValue(fileSize)
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

const utableProps = computed(() => {
  return {
    columns: toValue(columns),
    data: toValue(datasets),
  }
})

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
      <div v-if="datasets" class="mt-2">
        <USeparator icon="i-lucide:file" />
        <div class="py-3">
          <TableGeneric
            :utable-props
            title="Datasets"
          >
            <template #rawSize-cell="{ row }">
              <UBadge :label="row.original.size" variant="soft" />
            </template>
          </TableGeneric>

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
