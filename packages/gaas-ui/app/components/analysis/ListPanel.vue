<script setup lang="ts">
import type { SanitizedAnalysis } from '../../pages/analyses/index.vue'

interface Props {
  analyses?: SanitizedAnalysis[] | null
}
const props = withDefaults(defineProps<Props>(), { analyses: undefined })
const route = useRoute()

const { analyses } = toRefs(props)

const analysisId = computed(() => {
  if (route?.params && 'analysisId' in route.params) {
    const analysisId = route.params.analysisId
    if (Array.isArray(analysisId))
      return 0
    if (analysisId) {
      return Number.parseInt(analysisId)
    }
    return analysisId
  }
  return undefined
})
</script>

<template>
  <div class="overflow-y-auto divide-y divide-(--ui-border)">
    <div
      v-for="(analysis, index) in analyses" :key="index"
    >
      <NuxtLink
        :to="`/analyses/${analysis.id}`"
      >
        <div
          class="p-4 sm:px-6 cursor-pointer border-l-2 transition-colors"
          :class="[analysisId && analysisId === analysis.id ? 'border-(--ui-primary) bg-(--ui-primary)/10' : 'border-(--ui-bg) hover:border-(--ui-primary) hover:bg-(--ui-primary)/5']"
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
      </NuxtLink>
    </div>
  </div>
</template>
