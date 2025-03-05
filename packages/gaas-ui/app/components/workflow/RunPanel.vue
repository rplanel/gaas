<script setup lang="ts">
import type { SanitizedWorkflowDbItem } from '../../types'

defineProps<{
  workflow: SanitizedWorkflowDbItem
}>()

const emits = defineEmits(['close'])

// const toast = useToast()

// const reply = ref('')
// const loading = ref(false)

// function onSubmit() {
//   loading.value = true

//   setTimeout(() => {
//     reply.value = ''

//     toast.add({
//       title: 'Email sent',
//       description: 'Your email has been sent successfully',
//       icon: 'i-lucide-check-circle',
//       color: 'success',
//     })

//     loading.value = false
//   }, 1000)
// }
</script>

<template>
  <UDashboardPanel id="workflow-run-1">
    <UDashboardNavbar title="Invoke" :toggle="false">
      <template #leading>
        <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="-ms-1.5" @click="emits('close')" />
      </template>

      <template #right>
        ???
      </template>
    </UDashboardNavbar>
    <div class="flex flex-col sm:flex-row justify-between gap-1 p-4 sm:px-6 border-b border-(--ui-border)">
      <div class="flex items-start gap-4 sm:my-1.5">
        <GalaxyWorkflowInvokeForm
          v-if="workflow"
          :workflow-id="workflow.id"
        />
      </div>
    </div>
  </UDashboardPanel>
</template>
