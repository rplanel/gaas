<script setup lang="ts">
import type { Database } from '#build/types/database'
import type { InputDatasets, OutputDatasets } from '../../../pages/analyses/[analysisId]/index.vue'

export interface Props {
  items: InputDatasets | OutputDatasets | undefined
}
const props = withDefaults(defineProps<Props>(), {})
const supabase = useSupabaseClient<Database>()
const { items } = toRefs(props)

const sanitizedItems = computed(() => {
  const itemsVal = toValue(items)

  if (itemsVal) {
    return itemsVal.map((item) => {
      const { fileSize } = useFileSize(item.file_size)
      return {
        ...item,
        humanFileSize: fileSize,
      }
    })
  }
  return undefined
})

async function downloadFile(storageId: string) {
  const { data: storageObject } = await supabase
    .schema('storage')
    .from('objects')
    .select()
    .eq('id', storageId)
    .limit(1)
    .single()
  if (storageObject && storageObject?.name) {
    const { data } = await supabase.storage
      .from('analysis_files')
      .download(storageObject.name)
    const a = document.createElement('a')

    if (data) {
      document.body.appendChild(a)
      a.setAttribute('style', 'display: none')

      const url = window.URL.createObjectURL(data)
      a.href = url
      const filename = storageObject.name.split('/')[1]
      if (filename) {
        a.download = filename
        a.click()
      }
      window.URL.revokeObjectURL(url)
    }
  }
}
</script>

<template>
  <div>
    <div
      v-for="(dataset) in sanitizedItems"
      :key="dataset?.id"
      class="w-full border-b border-[var(--ui-border)] last:border-none"
    >
      <div
        v-if="dataset"
        class="p-3 grid grid-flow-col auto-cols-max items-center justify-between rounded-[calc(var(--ui-radius))] hover:bg-[var(--ui-bg-elevated)]"
        @click="downloadFile(dataset?.storage_object_id)"
      >
        <div
          class="grid grid-flow-col auto-cols-max items-center justify-items-start gap-2"
        >
          <div><UAvatar icon="i-mdi:download" /></div>

          <div>{{ dataset.dataset_name }}</div>
        </div>
        <div class="grid grid-flow-col-dense gap-1">
          <UBadge
            variant="soft"
            color="info"
          >
            {{ dataset.extension }}
          </UBadge>
          <UBadge variant="soft">
            {{ dataset.humanFileSize }}
          </UBadge>
          <GalaxyStatus :state="dataset.state" />
        </div>
      </div>
    </div>
  </div>
</template>
