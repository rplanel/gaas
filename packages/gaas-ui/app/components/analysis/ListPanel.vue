<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { SanitizedAnalysis } from '../../pages/analyses/index.vue'
import type { Database } from '../../types'

interface Props {
  analyses?: SanitizedAnalysis[] | null
}
const props = withDefaults(defineProps<Props>(), { analyses: undefined })
const supabase = useSupabaseClient<Database>()
const router = useRouter()
const route = useRoute()
// const toast = useToast()
const { analyses } = toRefs(props)
const isEditingAnalyses = ref<Record<number, string>>({})
const actionButtonProps = ref<ButtonProps>({ size: 'xs', variant: 'ghost', color: 'neutral' })
const items = [
  [
    {
      label: 'Delete',
      color: 'error' as const,
      icon: 'i-lucide-trash',
      slot: 'delete',
    },
  ],
]

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

async function deleteItem(item: SanitizedAnalysis) {
  try {
    await $fetch(`/api/db/analyses/${item.id}`, { method: 'DELETE' })
    // refreshAnalyses()
    // debugger
  }
  catch (error) {
    const { errorMessage } = useErrorMessage(error)
    const { errorStatus } = useErrorStatus(error)

    throw createError({
      message: toValue(errorMessage),
      statusCode: toValue(errorStatus),
    })
  }
}

function setEditState(id: number, name: string) {
  const isEditingAnalysesVal = toValue(isEditingAnalyses)
  isEditingAnalysesVal[id] = name
}

function resetEditAnalysis(id: number) {
  const isEditingAnalysesVal = toValue(isEditingAnalyses)
  if (isEditingAnalysesVal?.[id]) {
    const { [id]: toRemove, ...rest } = isEditingAnalysesVal
    isEditingAnalyses.value = rest
  }
}

async function editAnalysisName(id: number) {
  const isEditingAnalysesVal = toValue(isEditingAnalyses)
  if (isEditingAnalysesVal?.[id]) {
    const name = isEditingAnalysesVal[id]
    const { error } = await supabase
      .schema('galaxy')
      .from('analyses')
      .update({ name })
      .eq('id', id)
      .select()
    if (error) {
      const { errorMessage } = useErrorMessage(error)
      const { errorStatus } = useErrorStatus(error)
      throw createError({
        statusCode: toValue(errorStatus),
        statusMessage: toValue(errorMessage),
      })
    }
    const { [id]: toRemove, ...rest } = isEditingAnalyses.value
    isEditingAnalyses.value = rest
  }
}
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
          :class="[analysisId && analysisId === analysis.id ? 'border-(--ui-primary) bg-(--ui-primary)/20' : 'border-(--ui-bg) hover:border-(--ui-primary) hover:bg-(--ui-primary)/5']"
        >
          <div class="flex flex-row items-center justify-between">
            <div class="flex flex-row justify-start gap-4 items-center">
              <div>
                <GalaxyStatus :state="analysis.state" />
              </div>

              <div class="flex flex-col">
                <div
                  v-if="isEditingAnalyses?.[analysis.id]"
                  class="grid grid-flow-col-dense auto-cols-max gap-0.5 justify-start w-full"
                >
                  <div class="self-center w-full flex-1">
                    <UInput
                      v-if="isEditingAnalyses?.[analysis.id]" v-model="isEditingAnalyses[analysis.id]"
                      label="Analysis Name" class=""
                    />
                  </div>
                  <div class="self-center flex-none">
                    <UButton
                      color="success" variant="ghost" size="sm" icon="i-lucide:check"
                      @click="editAnalysisName(analysis.id)"
                    />
                  </div>
                  <div class="self-center flex-none">
                    <UButton
                      color="warning" variant="ghost" size="sm" icon="i-mdi:cancel"
                      @click="resetEditAnalysis(analysis.id)"
                    />
                  </div>
                </div>
                <div v-else class="font-medium text-(--ui-text-highlighted) text-base">
                  {{ analysis.name }}
                </div>
                <div class="text-(--ui-text-muted) text-sm">
                  {{ analysis.workflows }}
                </div>
              </div>
            </div>
            <div class="">
              <UButton
                v-bind="actionButtonProps"
                icon="lucide:pen"
                @click.prevent="setEditState(analysis.id, analysis.name)"
              />

              <UButton
                v-bind="actionButtonProps"
                icon="lucide:refresh-ccw"
                @click.prevent="router.push(`/analyses/${analysis.id}/rerun`)"
              />
              <UButton
                v-bind="actionButtonProps"
                color="error"
              />
              <UDropdownMenu :items="items">
                <UButton v-bind="actionButtonProps" icon="tabler:dots-vertical" />

                <template #delete>
                  <div @click="deleteItem(analysis)">
                    <UIcon name="i-lucide-trash" />
                    Delete
                  </div>
                </template>
              </UDropdownMenu>
            </div>
          </div>
        <!-- <p class="text-(--ui-text-dimmed) text-sm">
          {{  }} -->
        <!-- </p> -->
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
