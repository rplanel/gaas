<script setup lang="ts">
interface Props {
  version: string | undefined
}

const props = withDefaults(defineProps<Props>(), {})
const { version } = toRefs(props)
</script>

<template>
  <div>
    <UBadge
      v-if="version"
      icon="tabler:versions"
    >
      v{{ version }}
    </UBadge>
    <UBadge
      v-else
      icon="i-mdi:null"
    />
  </div>
</template>
