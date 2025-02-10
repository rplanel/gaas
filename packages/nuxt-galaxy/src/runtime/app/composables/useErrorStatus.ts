import type { ComputedRef, MaybeRef } from 'vue'
import { computed } from 'vue'
import { toErrorWithStatus } from '../utils/errors'

export function useErrorStatus(error: MaybeRef<unknown>, fallback: number = 500): { errorStatus: ComputedRef<number> } {
  const errorStatus = computed(() => {
    return toErrorWithStatus(error, fallback).statusCode
  })

  return { errorStatus }
}
