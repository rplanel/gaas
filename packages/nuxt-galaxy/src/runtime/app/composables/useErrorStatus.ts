import { computed, type ComputedRef, type MaybeRef } from 'vue'

export interface ErrorWithStatus {
  statusCode: number
}

export function useErrorStatus(error: MaybeRef<unknown>, fallback: number = 500): { errorStatus: ComputedRef<number> } {
  function isErrorWithStatus(error: unknown): error is ErrorWithStatus {
    return (
      typeof error === 'object'
      && error !== null
      && 'statusCode' in error
      && typeof (error as Record<string, unknown>).statusCode === 'number'
    )
  }

  function toErrorWithStatus(maybeError: unknown, fallback: number): ErrorWithStatus {
    if (isErrorWithStatus(maybeError)) {
      return maybeError
    };
    return { statusCode: fallback }
  }

  const errorStatus = computed(() => {
    return toErrorWithStatus(error, fallback).statusCode
  })

  return { errorStatus }
}
