<script setup lang="ts">
const links = [{
  label: 'job',
  icon: 'i-lucide-book-open',
  to: '#job',
}]
</script>

<template>
  <UContainer>
    <UPage>
      <template #right>
        <UPageAside>
          <UPageAnchors :links="links" />
        </UPageAside>
      </template>
      <slot />
    </UPage>
  </UContainer>
</template>
