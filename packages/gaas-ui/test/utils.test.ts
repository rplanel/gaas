import { describe, expect, it } from 'vitest'
import { countDecimals } from '../app/utils/index'

describe('test utils functions', () => {
  it('count decimals function', () => {
    expect(countDecimals(1.5)).toBe(1)
    expect(countDecimals(1e-3)).toBe(3)
    expect(countDecimals(1e5)).toBe(0)
    expect(countDecimals(1.23456789)).toBe(8)
    expect(countDecimals(1.23456789e-5)).toBe(13)
    expect(countDecimals(1.23456789e5)).toBe(3)
    expect(countDecimals(0.000005)).toBe(6)
  })
})
