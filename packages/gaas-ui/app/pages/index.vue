<script lang="ts"></script>

<template>
  <div>
    <UAlert
      color="neutral"
      variant="soft"
      class="my-6"
    >
      <template #title>
        <h1 class="text-4xl mb-6">
          Welcome to Galaxy Webservice
        </h1>
      </template>
      <template #description>
        This layer let you plug a galaxy instance to your Nuxt app
      </template>
    </UAlert>

    <UButton to="/datasets">
      Get started
    </UButton>
  </div>
</template>
