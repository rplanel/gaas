<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { BreadcrumbItem } from '#ui/types'
import { z } from 'zod'

definePageMeta({
  layout: 'dashboard',
})
type Database = SupabaseTypes.Database

const breadcrumbsItems = ref<BreadcrumbItem[]>([
  {
    icon: 'lucide:house',
    disabled: false,
    to: '/',
  },
  {
    label: 'Datasets',
    disabled: true,
    to: '/datasets',
  },
])
const fileRef = ref<HTMLInputElement>()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const uploadingFile = ref(false)
const schema = z.object({
  file: z.any(),
})
type DatasetColumn = Database['galaxy']['Views']['uploaded_datasets_with_storage_path']['Row']

type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({
  file: undefined,
})

const { refreshDatasetsCount } = inject('datasetsCount')

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
      refreshDatasetsCount()
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
      refreshDatasetsCount()
    }
  }
}
function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <UDashboardPanel id="datasets" title="Datasets">
    <template #header>
      <UDashboardNavbar title="Datasets" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UForm :schema="schema" :state="state">
            <UButton
              icon="i-lucide-plus" size="md" class="rounded-full" :disabled="uploadingFile"
              :loading="uploadingFile" @click="onFileClick"
            />
            <input ref="fileRef" type="file" class="hidden" @change="uploadFile">
          </UForm>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <UPage>
        <NuxtPage :breadcrumbs-items="breadcrumbsItems" :datasets="data" />
      </UPage>
    </template>
  </UDashboardPanel>
</template>
