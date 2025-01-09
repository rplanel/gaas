import type { ComputedRef, MaybeRef } from '#imports'
import { computed, toValue } from '#imports'

export function useGalaxyHint(help: MaybeRef<string | null> = null, argument: MaybeRef<string | null> = null): { hint: ComputedRef<string> } {
  const sanitizedHint = computed(() => {
    return [toValue(argument), toValue(help)].filter(h => h !== null && h !== undefined && h !== '').join(': ')
  })

  return { hint: sanitizedHint }
}
