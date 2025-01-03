<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

interface Props {
  title: string
  description?: string | undefined
  breadcrumbsItems?: BreadcrumbItem[] | undefined
  icon?: string | undefined
}

withDefaults(defineProps<Props>(), {
  title: 'Title',
  description: undefined,
  breadcrumbsItems: undefined,
  icon: undefined,

})
</script>

<template>
  <div class="pb-5 mb-10">
    <div v-if="breadcrumbsItems" class="py-4">
      <UBreadcrumb :items="breadcrumbsItems" />
    </div>

    <div class="mt-5 flex items-center justify-between gap-3">
      <div class="grid grid-flow-col items-center gap-3">
        <div v-if="icon">
          <UIcon :name="icon" class="size-10" />
        </div>
        <div>
          <slot name="title" :title="title">
            <h1 class="text-3xl font-bold text-[var(--ui-text-highlighted)]">
              {{ title }}
            </h1>
          </slot>
          <div v-if="description">
            <slot name="description" :description>
              <div class="text-lg text-[var(--ui-text-muted)] mt-4">
                {{ description }}
              </div>
            </slot>
          </div>
        </div>
      </div>
      <!-- trailing content -->
      <div>
        <div class="py-4">
          <slot name="trailing-content" />
        </div>
      </div>
    </div>
  </div>
</template>
