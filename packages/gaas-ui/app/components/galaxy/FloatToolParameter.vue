<script setup lang="ts">
import type { GalaxyFloatToolParameter } from 'blendtype'
import { useVModel } from '@vueuse/core'

export interface GalaxyFloatToolParameterProps
  extends GalaxyFloatToolParameter {
  modelValue: string
  variant: 'form' | 'display'
}
const props = withDefaults(defineProps<GalaxyFloatToolParameterProps>(), {
  optional: false,
  variant: 'form',
})
const emit = defineEmits(['update:modelValue'])

const { min, max } = toRefs(props)

const proxyValue = useVModel(props, 'modelValue', emit)
const { hint } = useGalaxyHint(props.help, props.argument)

const step = computed(() => {
  const defaultValue = toValue(proxyValue)
  const numberDecimal = countDecimals(Number.parseFloat(defaultValue))
  return Number.parseFloat(`1e-${numberDecimal}`)
})

function countDecimals(value: number) {
  if (!Number.isFinite(value))
    return 0 // Check if the number is finite.

  const text = value.toString()

  // Check for scientific notation
  if (text.includes('e')) {
    const parts = text.split('e')

    if (parts.length >= 2 && parts[1] && parts[0]) {
      const exponent = Number.parseInt(parts[1], 10)
      const decimalParts = parts[0].split('.')
      if (decimalParts[1]) {
        const baseDecimals = decimalParts.length > 1 ? decimalParts[1].length : 0
        if (exponent < 0) {
          // Negative exponent: Increase the number of decimals
          return baseDecimals - exponent
        }
        else {
          // Positive exponent: Subtracts the exponent from the base decimals
          return Math.max(0, baseDecimals - exponent)
        }
      }
    }
  }

  // Normal decimal counting
  if (text.includes('.')) {
    const splittedText = text.split('.')
    if (splittedText[1]) {
      return splittedText[1].length
    }
  }

  return 0 // No decimal places if there's no decimal point
}
</script>

<template>
  <div class="flex flex-row w-full">
    <div class="text-[var(--ui-color-info-300)] self-center mx-2">
      <UIcon
        size="22"
        name="i-mdi:decimal"
      />
    </div>
    <div class="mx-2">
      <USeparator orientation="vertical" />
    </div>
    <div
      v-if="variant === 'form'"
      class="self-center mx-2"
    >
      <UFormField
        :label
        :help="hint"
      >
        <UInput
          v-model="proxyValue"
          :step
          type="number"
          :min
          :max
        />
      </UFormField>
    </div>
    <div
      v-if="variant === 'display'"
      class="grid grid-flow-col auto-cols-max gap-2 mx-2 w-full"
    >
      <div class="font-medium">
        {{ label }}
      </div>
      <div class="">
        <USeparator orientation="vertical" />
      </div>
      <div class="">
        <UBadge color="primary">
          {{ proxyValue }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
