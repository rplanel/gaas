<script setup lang="ts">
import { useState } from '#imports'

useState('showWorkflowStepParameter', () => true)
</script>

<template>
  <div>
    <AppHeader />
    <UMain>
      <slot />
    </UMain>
    <USeparator type="dashed" class="h-px" />
    <AppFooter />
  </div>
</template>
