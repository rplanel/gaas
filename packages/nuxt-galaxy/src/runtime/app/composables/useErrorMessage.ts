import type { ComputedRef, MaybeRef } from 'vue'
import { computed, toValue } from 'vue'
import { toErrorWithMessage } from '../utils/errors'

export function useErrorMessage(error: MaybeRef<unknown>): { errorMessage: ComputedRef<string> } {
  const errorMessage = computed(() => {
    return toErrorWithMessage(toValue(error)).message
  })
  return { errorMessage }
}
