import type { ErrorWithMessage, ErrorWithStatus } from '../../src/runtime/app/utils/errors'
import { describe, expect, it } from 'vitest'
import {

  getErrorMessage,
  isErrorWithMessage,
  isErrorWithStatus,
  toErrorWithMessage,
  toErrorWithStatus,
} from '../../src/runtime/app/utils/errors'

describe('type Guards', () => {
  describe('isErrorWithMessage', () => {
    it('should identify valid ErrorWithMessage objects', () => {
      const error: ErrorWithMessage = new Error('test error')
      expect(isErrorWithMessage(error)).toBe(true)
    })

    it('should reject invalid objects', () => {
      expect(isErrorWithMessage(null)).toBe(false)
      expect(isErrorWithMessage(undefined)).toBe(false)
      expect(isErrorWithMessage({ message: 123 })).toBe(false)
      expect(isErrorWithMessage({})).toBe(false)
    })
  })

  describe('isErrorWithStatus', () => {
    it('should identify valid ErrorWithStatus objects', () => {
      const error: ErrorWithStatus = { statusCode: 404 }
      expect(isErrorWithStatus(error)).toBe(true)
    })

    it('should reject invalid status codes', () => {
      expect(isErrorWithStatus({ statusCode: '404' })).toBe(false)
      expect(isErrorWithStatus(null)).toBe(false)
      expect(isErrorWithStatus({})).toBe(false)
      expect(isErrorWithStatus({ statuscode: 404 })).toBe(false)
    })
  })
})

describe('converters', () => {
  describe('toErrorWithMessage', () => {
    it('should pass through valid errors', () => {
      const error: ErrorWithMessage = { message: 'original error' }
      expect(toErrorWithMessage(error)).toEqual(error)
    })

    it('should convert non-error objects', () => {
      const result = toErrorWithMessage({ foo: 'bar' })
      expect(result.message).toBe('{"foo":"bar"}')
    })

    it('should handle circular references', () => {
      const circular: any = { a: 'test' }
      circular.self = circular
      const result = toErrorWithMessage(circular)
      expect(result.message).toBeTruthy()
    })

    it('should handle null', () => {
      const result = toErrorWithMessage(null)
      expect(result.message).toBe('null')
    })

    it('should handle undefined', () => {
      const result = toErrorWithMessage(undefined)
      expect(result.message).toBe('')
    })
  })

  describe('toErrorWithStatus', () => {
    it('should preserve existing status codes', () => {
      const error: ErrorWithStatus = { statusCode: 404 }
      expect(toErrorWithStatus(error, 500)).toEqual(error)
    })

    it('should apply fallback status', () => {
      const result = toErrorWithStatus({ message: 'error' }, 500)
      expect(result.statusCode).toBe(500)
    })
  })
})

describe('utilities', () => {
  describe('getErrorMessage', () => {
    it('should prefer statusMessage over message', () => {
      const error = {
        message: 'base message',
        statusMessage: 'status message',
      }
      expect(getErrorMessage(error)).toBe('status message')
    })

    it('should fall back to message', () => {
      const error = { message: 'base message' }
      expect(getErrorMessage(error)).toBe('base message')
    })

    it('should handle non-error objects', () => {
      expect(getErrorMessage('string error')).toBeTruthy()
      expect(getErrorMessage(null)).toBeTruthy()
    })
  })
})
