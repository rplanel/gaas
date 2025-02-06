<script setup lang="ts" generic="T">
import type { TableProps } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'

interface Props<T> {
  utableProps: TableProps<T>
}

defineProps<Props<T>>()
const table = useTemplateRef('table')
const filterInput = useTemplateRef('filterInput')

defineShortcuts({
  '/': () => {
    filterInput.value?.inputRef?.focus()
  },
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
})
const pageSizeOptions = ref([1, 5, 10, 15])
const globalFilter = ref('')
</script>

<template>
  <div>
    <UCard :ui="{ body: 'p-0 sm:p-0' }" class="mb-4">
      <div class="w-full space-y-4 pb-4">
        <div class="flex p-3 w-full">
          <UInput ref="filterInput" v-model="globalFilter" size="lg" icon="lucide:filter" class="w-full" placeholder="Filter...">
            <template #trailing>
              <template v-if="globalFilter?.length">
                <UButton
                  color="neutral"
                  variant="link"

                  icon="lucide:circle-x"
                  aria-label="Clear input"
                  @click="globalFilter = ''"
                />
              </template>
              <template v-else>
                <UKbd value="/" />
              </template>
            </template>
          </UInput>
        </div>
        <UTable
          ref="table"
          v-model:pagination="pagination"
          v-model:global-filter="globalFilter"

          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel(),
          }"
          v-bind="utableProps"
          class="flex"
        >
          <template
            v-for="(_, slotName) in $slots"
            #[slotName]="slotProps"
          >
            <slot :name="slotName" v-bind="slotProps ?? {}" />
          </template>
        </UTable>
        <div class="flex justify-center border-t border-[var(--ui-border)] pt-4 gap-2">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
          <USelect v-model="pagination.pageSize" :items="pageSizeOptions" variant="soft" @update:model-value="(s) => table?.tableApi.setPageSize(s)" />
        </div>
      </div>
    </UCard>
  </div>
</template>
