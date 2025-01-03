<script setup lang="ts">
const breadcrumbsItems = ref([
  {
    label: 'Home',
    disabled: false,
    to: '/',
  },
  {
    label: 'Galaxy',
    disabled: true,
    to: '/galaxy',
  },
])

const { data: galaxyInstanceDetails } = await useFetch(
  '/api/galaxy/instance',
  { method: 'GET' },
)
</script>

<template>
  <div>
    <PageHeader
      title="Galaxy"
      description="Description of the Galaxy instance the web application is connected to."
      icon="i-file-icons:galaxy"
      :breadcrumbs-items="breadcrumbsItems"
    />
    <UAlert
      v-if="galaxyInstanceDetails"
      color="info"
      variant="soft"
      class="m-5"
    >
      <template #description>
        This web application will use the Galaxy Instance @
        <ULink
          target="_blank"
          :href="galaxyInstanceDetails.url"
        >
          {{
            galaxyInstanceDetails.url
          }}
        </ULink>
        version <strong>{{ galaxyInstanceDetails.version_major }}</strong>
      </template>
    </UAlert>
  </div>
</template>
