<script setup lang="ts">
import { UPage } from '#components'
import { useState } from '#imports'

useState('showWorkflowStepParameter', () => true)
</script>

<template>
  <UContainer>
    <UPage>
      <slot />
    </UPage>
  </UContainer>
</template>
