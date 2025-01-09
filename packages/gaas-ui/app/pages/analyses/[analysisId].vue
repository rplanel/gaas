<script setup lang="ts">
import type { SupabaseTypes } from '#build/types/database'
import type { BreadcrumbItem } from '@nuxt/ui'

type Database = SupabaseTypes.Database

interface Props {
  breadcrumbsItems?: BreadcrumbItem[] | undefined
}
const props = withDefaults(defineProps<Props>(), { breadcrumbsItems: undefined })
const { breadcrumbsItems } = toRefs(props)
const route = useRoute()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const analysisId = computed(() => {
  const analysisId = route?.params?.analysisId
  if (Array.isArray(analysisId))
    return 0
  if (analysisId !== undefined) {
    return Number.parseInt(analysisId)
  }
  return analysisId
})

const { data: analysis } = await useAsyncData(
  `analysis-${toValue(analysisId)}`,
  async () => {
    const analysisIdVal = toValue(analysisId)
    const userVal = toValue(user)

    if (userVal === null) {
      throw createError({
        statusMessage: 'User not found',
        statusCode: 404,
      })
    }
    if (analysisIdVal === undefined) {
      throw createError({
        statusMessage: 'Analysis not found',
        statusCode: 404,
      })
    }
    const { data, error } = await supabase
      .schema('galaxy')
      .from('analyses')
      .select()
      .eq('id', analysisIdVal)
      .limit(1)
      .returns<Database['galaxy']['Tables']['analyses']['Row'][]>()

    if (error) {
      throw createError({
        statusMessage: error.message,
        statusCode: Number.parseInt(error.code),
      })
    }
    if (data === null) {
      throw createError({
        statusMessage: '',
        statusCode: 500,
      })
    }
    return data[0]
  },

)

const computedBreadcrumbsItems = computed(() => {
  const analysisVal = toValue(analysis)
  const breadcrumbsItemsVal = toValue(breadcrumbsItems)
  if (analysisVal && breadcrumbsItemsVal) {
    return [
      ...breadcrumbsItemsVal.map(breadcrumb => ({ ...breadcrumb, disabled: false })),
      {
        label: analysisVal.name,
        disabled: true,
        to: `/analyses/${toValue(analysisId)}`,
      },
    ]
  }
  return breadcrumbsItemsVal
})
</script>

<template>
  <div>
    <NuxtPage :breadcrumbs-items="computedBreadcrumbsItems" :analysis-id="analysisId" />
  </div>
</template>
