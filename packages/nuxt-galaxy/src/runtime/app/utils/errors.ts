export interface ErrorWithMessage {
  message: string
  statusMessage?: string
}

export interface ErrorWithStatus {
  statusCode: number
}
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof (error as Record<string, unknown>).message === 'string'
  )
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError))
    return maybeError

  if (typeof maybeError === 'string')
    return new Error(maybeError)

  try {
    return new Error(JSON.stringify(maybeError))
  }
  catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error)?.statusMessage ?? toErrorWithMessage(error).message
}

export function isErrorWithStatus(error: unknown): error is ErrorWithStatus {
  return (
    typeof error === 'object'
    && error !== null
    && 'statusCode' in error
    && typeof (error as Record<string, unknown>).statusCode === 'number'
  )
}

export function toErrorWithStatus(maybeError: unknown, fallback: number): ErrorWithStatus {
  if (isErrorWithStatus(maybeError)) {
    return maybeError
  };
  return { statusCode: fallback }
}

export function getStatusCode(error: unknown, fallback: number = 500): number {
  return toErrorWithStatus(error, fallback).statusCode
}
