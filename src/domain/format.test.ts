import { describe, expect, test } from 'vitest'
import { formatNumber } from './format.ts'

describe('formatNumber', () => {
  test.each([
    [87.5, '87,5'],
    [85, '85'],
    [83.75, '83,75'],
    [0, '0'],
  ])('%s se muestra como "%s"', (value, expected) => {
    expect(formatNumber(value)).toBe(expected)
  })
})
