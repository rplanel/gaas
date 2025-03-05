<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { SanitizedWorkflowDbItem } from '../../types'

interface Props {
  workflows?: SanitizedWorkflowDbItem[] | null
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const props = withDefaults(defineProps<Props>(), { workflows: undefined })
const selectedWorkflow = defineModel<SanitizedWorkflowDbItem | undefined>()

const { workflows } = toRefs(props)
const workflowsRefs = ref<Element[]>([])

watch(selectedWorkflow, () => {
  if (!selectedWorkflow.value) {
    return
  }
  const ref = workflowsRefs.value[selectedWorkflow.value.id]
  if (ref) {
    ref.scrollIntoView({ block: 'nearest' })
  }
})
// const pageHeaderProps = computed(() => {
//   return {
//     title: 'Workflows',
//     description: 'Select a workflow in order to start an analysis',
//     headline: 'List',
//     ui: { root: 'border-b-0' },

//   }
// })
</script>

<template>
  <div class="overflow-y-auto divide-y divide-(--ui-border)">
    <!-- <PageHeader :page-header-props icon="i-lucide:workflow" /> -->

    <div
      v-for="(workflow, index) in workflows" :key="index"
    >
      <div
        class="p-4 sm:px-6 text-sm cursor-pointer border-l-2 transition-colors"
        :class="[

          selectedWorkflow && selectedWorkflow.id === workflow.id ? 'border-(--ui-primary) bg-(--ui-primary)/10' : 'border-(--ui-bg) hover:border-(--ui-primary) hover:bg-(--ui-primary)/5',
        ]"
        @click="selectedWorkflow = workflow"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            {{ workflow.name }}
          </div>
          <span><VersionBadge :version="workflow.version.toString()" /></span>
        </div>
        <p class="text-(--ui-text-dimmed) line-clamp-1">
          {{ workflow.definition.annotation }}
        </p>
      </div>
    </div>
  </div>
</template>
