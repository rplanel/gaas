import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useErrorMessage } from '../../src/runtime/app/composables/useErrorMessage'

describe('useErrorMessage', () => {
  describe('with static errors', () => {
    it('should handle Error objects', () => {
      const error = new Error('test error')
      const { errorMessage } = useErrorMessage(error)
      expect(errorMessage.value).toBe('test error')
    })

    it('should handle string messages', () => {
      const { errorMessage } = useErrorMessage('string error')
      expect(errorMessage.value).toBe('string error')
    })

    it('should handle objects', () => {
      const error = { foo: 'bar' }
      const { errorMessage } = useErrorMessage(error)
      expect(errorMessage.value).toBe('{"foo":"bar"}')
    })

    it('should handle null', () => {
      const { errorMessage } = useErrorMessage(null)
      expect(errorMessage.value).toBe('null')
    })

    it('should handle undefined', () => {
      const { errorMessage } = useErrorMessage(undefined)
      expect(errorMessage.value).toBe('')
    })
  })

  describe('with reactive errors', () => {
    it('should update when ref error changes', () => {
      const errorRef = ref(new Error('initial error'))
      const { errorMessage } = useErrorMessage(errorRef)

      expect(errorMessage.value).toBe('initial error')

      errorRef.value = new Error('updated error')
      expect(errorMessage.value).toBe('updated error')
    })

    it('should handle ref value type changes', () => {
      const errorRef = ref<unknown>(new Error('error'))
      const { errorMessage } = useErrorMessage(errorRef)

      expect(errorMessage.value).toBe('error')

      errorRef.value = { custom: 'error' }
      expect(errorMessage.value).toBe('{"custom":"error"}')

      errorRef.value = 'string message'
      expect(errorMessage.value).toBe('string message')
    })
  })
})
