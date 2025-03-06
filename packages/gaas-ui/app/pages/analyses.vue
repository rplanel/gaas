<script setup lang="ts">
import type { Database } from '../types'
import type { ListAnalysisWithWorkflow, SanitizedAnalysis } from './analyses/index.vue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

definePageMeta({
  layout: 'dashboard',
})
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const selectedAnalysis = ref<SanitizedAnalysis | undefined>()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

const isAnalysisDetailsPanelOpen = computed({
  get() {
    return !!selectedAnalysis.value
  },
  set(value: boolean) {
    if (!value) {
      selectedAnalysis.value = undefined
    }
  },
})
// const breadcrumbsItems = ref([
//   {
//     // label: 'Home',
//     disabled: false,
//     icon: 'lucide:house',
//     to: '/',
//   },
//   {
//     label: 'Analyses',
//     disabled: true,
//     to: '/analyses',
//   },
// ])

// const pageHeaderProps = computed(() => {
//   return {
//     title: 'Analysis',
//     description: 'All analyses that has been run',
//     ui: {
//       root: 'relative border-b-0 border-[var(--ui-border)] py-8',
//     },

//   }
// })
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

    <!-- <template #body> -->
    <!-- <UPage> -->
    <!-- <PageHeader :page-header-props icon="i-lucide:workflow" :breadcrumbs-items="breadcrumbsItems" /> -->
    <AnalysisListPanel v-model="selectedAnalysis" :analyses="sanitizedAnalyses" />

    <!-- <NuxtPage :breadcrumbs-items="breadcrumbsItems" /> -->
    <!-- </UPage> -->
    <!-- </template> -->
  </UDashboardPanel>
  <AnalysisDetailPanel v-if="selectedAnalysis" :analysis="selectedAnalysis" />

  <div v-else class="hidden lg:flex flex-1 items-center justify-center">
    <UIcon name="i-lucide:workflow" class="size-32 text-(--ui-text-dimmed)" />
  </div>
  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isAnalysisDetailsPanelOpen">
      <template #content>
        <AnalysisDetailPanel v-if="selectedAnalysis" :analysis="selectedAnalysis" />
      </template>
    </USlideover>
  </ClientOnly>
</template>
