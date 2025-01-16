<script setup lang="ts">
const route = useRoute()

definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div>
    <USeparator icon="tabler:chart-scatter" />
    <div>
      <div class="py-4">
        <UButton block size="xl" label="Display the results" variant="soft" :to="`${route.path}/results`">
          Display results
        </UButton>
      </div>
    </div>
  </div>
</template>
