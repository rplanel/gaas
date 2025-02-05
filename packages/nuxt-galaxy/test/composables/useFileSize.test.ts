import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useFileSize } from '../../src/runtime/app/composables/useFileSize'

describe('useFileSize', () => {
  describe('basic functionality', () => {
    it('handles bytes under threshold', () => {
      const { fileSize } = useFileSize(100)
      expect(fileSize.value).toBe('100 B')
    })

    it('handles zero bytes', () => {
      const { fileSize } = useFileSize(0)
      expect(fileSize.value).toBe('0 B')
    })

    it('handles undefined input', () => {
      const { fileSize } = useFileSize(undefined)
      expect(fileSize.value).toBeUndefined()
    })
  })

  describe('size conversions', () => {
    it('converts to KB', () => {
      const { fileSize } = useFileSize(1536) // 1.5 KB
      expect(fileSize.value).toBe('1.5 KB')
    })

    it('converts to MB', () => {
      const { fileSize } = useFileSize(1.5 * 1024 * 1024)
      expect(fileSize.value).toBe('1.5 MB')
    })

    it('converts to GB', () => {
      const { fileSize } = useFileSize(2.5 * 1024 * 1024 * 1024)
      expect(fileSize.value).toBe('2.5 GB')
    })

    it('handles large numbers', () => {
      const { fileSize } = useFileSize(1.5 * 1024 * 1024 * 1024 * 1024) // 1.5 TB
      expect(fileSize.value).toBe('1.5 TB')
    })
  })

  describe('reactive updates', () => {
    it('updates when ref changes', () => {
      const bytesRef = ref(1024)
      const { fileSize } = useFileSize(bytesRef)

      expect(fileSize.value).toBe('1.0 KB')

      bytesRef.value = 2048
      expect(fileSize.value).toBe('2.0 KB')

      bytesRef.value = 512
      expect(fileSize.value).toBe('512 B')
    })

    it('handles undefined in reactive updates', () => {
      const bytesRef = ref<number | undefined>(1024)
      const { fileSize } = useFileSize(bytesRef)

      expect(fileSize.value).toBe('1.0 KB')

      bytesRef.value = undefined
      expect(fileSize.value).toBeUndefined()
    })
  })
})
