import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
// import { useColorMode } from '@vueuse/core'
import { describe, expect, it } from 'vitest'
import ColorModeButton from '../../app/components/ColorModeButton.vue'

describe('myComponent', () => {
  // let mockUseColorMode: any

  // beforeEach(() => {
  //   mockUseColorMode = vi.mocked(useColorMode, {
  //     default: () => ({
  //       value: 'dark',
  //     }),
  //   })
  //   vi.clearAllMocks()
  // })

  it('renders properly in dark mode', async () => {
    await renderSuspended(ColorModeButton)
    expect(screen.getAllByRole('button')).toBeDefined()
  })

  // it('toggles between dark and light modes', async () => {
  //   const html = await renderSuspended(ColorModeButton)
  //   const button = html.querySelector('button')

  //   button.click()
  //   expect(mockUseColorMode().value).toBe('light')

  //   button.click()
  //   expect(mockUseColorMode().value).toBe('dark')
  // })

  // it('has correct button attributes', async () => {
  //   const html = await renderSuspended(ColorModeButton)
  //   const button = html().querySelector('button')

  //   expect(button?.getAttribute('color')).toBe('neutral')
  //   expect(button?.getAttribute('variant')).toBe('ghost')
  // })
})
