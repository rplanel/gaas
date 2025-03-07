<script setup lang="ts">
import type { Database } from '../types'
import type { ListAnalysisWithWorkflow, SanitizedAnalysis } from './analyses/index.vue'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const { data: analyses,
  // refresh: refreshAnalyses
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
const sanitizedAnalyses = computed<SanitizedAnalysis[]>(() => {
  const analysesVal = toValue(analyses)
  if (analysesVal && Array.isArray(analysesVal)) {
    return analysesVal?.map((a) => {
      const { id, name, state, is_sync } = a
      return {
        id,
        name,
        state,
        is_sync,
        workflows: a.workflows.name,
      }
    })
  }
  return []
})

// onBeforeRouteUpdate((to) => {
//   // debugger
//   if (to.name === 'analyses')
//     selectedAnalysisId.value = undefined
// })

// watch(selectedAnalysisId, () => {
//   // debugger
//   if (selectedAnalysisId.value !== undefined) {
//     router.push(`/workflows/${selectedAnalysisId.value}/run`)
//   }
// })
</script>

<template>
  <UDashboardPanel id="analyses-list" title="Analyses" :default-size="25" :min-size="20" :max-size="35" resizable>
    <UDashboardNavbar title="Analyses">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #trailing>
        <UBadge :label="sanitizedAnalyses?.length ?? 0" variant="subtle" />
      </template>
      <template #right>
        <UButton icon="i-lucide-plus" size="md" class="rounded-full" to="/workflows" />
      </template>
    </UDashboardNavbar>
    <AnalysisListPanel :analyses="sanitizedAnalyses" />
  </UDashboardPanel>
  <NuxtPage />
</template>
