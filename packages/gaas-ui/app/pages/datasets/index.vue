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
  name: string
  size?: string
  rawSize?: number
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
</script>

<template>
  <div>
    <PageHeader
      title="Datasets"
      description="From here you can upload a dataset and have the list of all the datasets available."
      icon="i-lucide-files"
      :breadcrumbs-items="breadcrumbsItems"
    />

    <div class="grid grid-flow-row auto-rows-max gap-6">
      <div>
        <!-- <h2 class="text-xl font-bold mb-2 mt-4">Upload</h2> -->
        <div>
          <UForm
            :schema="schema"
            :state="state"
          >
            <UFormField
              label="Upload a dataset"
              name="file"
              required
              class="text-lg"
            >
              <UInput
                v-model="state.file"
                type="file"
                icon="i-lucide:paperclip"
                :disabled="uploadingFile"
                :loading="uploadingFile"
                class="w-full"
                size="xl"
                @change="uploadFile"
              />
            </UFormField>
          </UForm>
        </div>
      </div>
      <div v-if="datasets" class="mt-5">
        <!-- <h2 class="text-xl font-bold mb-3 mt-4">Datasets</h2> -->
        <UTable
          :data="datasets"
          :columns
          class="ring ring-[var(--ui-border-muted)] rounded-[calc(var(--ui-radius)*1.5)]"
        >
          <template #rawSize-cell="{ row }">
            <UBadge :label="row.original.size" />
          </template>
        </UTable>
      </div>
      <!-- <div>
        <UButton to="/workflows" trailing-icon="i-lucide-arrow-right"
          >workflows</UButton
        >
      </div> -->
    </div>
  </div>
</template>
