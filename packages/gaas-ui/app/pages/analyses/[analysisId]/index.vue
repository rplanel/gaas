<script setup lang="ts">
import { AnalysisDetailPanel } from '#components'

interface Props {
  analysisId?: number | undefined
}
withDefaults(defineProps<Props>(), { analysisId: undefined })
const router = useRouter()

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const isOpen = ref(true)
</script>

<template>
  <AnalysisDetailPanel v-if="analysisId" :analysis-id="analysisId" @close="router.push('/analyses')" />
  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isOpen">
      <template #content>
        <AnalysisDetailPanel v-if="analysisId" :analysis-id="analysisId" @close="router.push('/analyses')" />
      </template>
    </USlideover>
  </ClientOnly>
  <!-- <div>
    <USeparator icon="tabler:chart-scatter" />
    <div>
      <div class="py-4">
        <UButton block size="xl" label="Display the results" variant="soft" :to="`${route.path}/results`">
          Display results
        </UButton>
      </div>
    </div>
  </div> -->
</template>
