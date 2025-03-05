<script setup lang="ts">
import type { SanitizedAnalysis } from '../../pages/analyses/index.vue'
import { UPageList } from '#components'

interface Props {
  analyses?: SanitizedAnalysis[] | null
}
const props = withDefaults(defineProps<Props>(), { analyses: undefined })
const selectedAnalysis = defineModel<SanitizedAnalysis | undefined>()

const { analyses } = toRefs(props)
const workflowsRefs = ref<Element[]>([])

watch(selectedAnalysis, () => {
  if (!selectedAnalysis.value) {
    return
  }
  const ref = workflowsRefs.value[selectedAnalysis.value.id]
  if (ref) {
    ref.scrollIntoView({ block: 'nearest' })
  }
})
</script>

<template>
  <div>
    <UPageList class="border-l-2">
      <UPageCard
        v-for="(analysis, index) in analyses"
        :key="index"
        :title="analysis.name"
        :highlight="selectedAnalysis?.id === analysis.id"
        variant="ghost"
        :description="analysis.workflows"
        :ui="{ container: 'lg:grid-cols-1 lg:items-center' }"
        @click="selectedAnalysis = analysis"
      />
    </UPageList>
  </div>
</template>
