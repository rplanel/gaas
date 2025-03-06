<script setup lang="ts">
import type { SanitizedAnalysis } from '../../pages/analyses/index.vue'

interface Props {
  analyses?: SanitizedAnalysis[] | null
}
const props = withDefaults(defineProps<Props>(), { analyses: undefined })

const selectedAnalysis = defineModel<SanitizedAnalysis | undefined>()

const { analyses } = toRefs(props)
const analysesRefs = ref<Element[]>([])
watch(selectedAnalysis, () => {
  if (!selectedAnalysis.value) {
    return
  }
  const ref = analysesRefs.value[selectedAnalysis.value.id]
  if (ref) {
    ref.scrollIntoView({ block: 'nearest' })
  }
})
</script>

<template>
  <div class="overflow-y-auto divide-y divide-(--ui-border)">
    <div
      v-for="(analysis, index) in analyses" :key="index"
    >
      <div
        class="p-4 sm:px-6 cursor-pointer border-l-2 transition-colors"
        :class="[

          selectedAnalysis && selectedAnalysis.id === analysis.id ? 'border-(--ui-primary) bg-(--ui-primary)/10' : 'border-(--ui-bg) hover:border-(--ui-primary) hover:bg-(--ui-primary)/5',
        ]"
        @click="selectedAnalysis = analysis"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 font-bold">
            {{ analysis.name }}
          </div>
          <span>{{ analysis.state }}</span>
        </div>
        <!-- <p class="text-(--ui-text-dimmed) text-sm">
          {{  }} -->
        <!-- </p> -->
      </div>
    </div>
  </div>
</template>
