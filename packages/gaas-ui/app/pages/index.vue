<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})
const { data: page, error } = await useAsyncData('home', () => {
  return queryCollection('landing').first()
})
</script>

<template>
  <div>
    landing
    <pre>{{ error }}</pre>
    <pre>{{ page }}</pre>
    <!-- <UPageHero
      :title="page.hero.title"
      :description="page.hero.description"
      :links="page.hero.links"
      class="relative"
    /> -->
  </div>
</template>
