<script setup lang="ts">
import { useState } from '#imports'

useState('showWorkflowStepParameter', () => true)
</script>

<template>
  <UContainer>
    <slot />
  </UContainer>
</template>
