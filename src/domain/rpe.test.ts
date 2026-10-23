import { describe, expect, test } from 'vitest'
import { RPE_VALUES, rpeDescription, rpeTone } from './rpe.ts'

describe('escala RPE', () => {
  test('va del 1 al 10', () => {
    expect(RPE_VALUES).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  test.each([
    [1, 'low'],
    [5, 'low'],
    [6, 'neutral'],
    [8, 'neutral'],
    [9, 'high'],
    [10, 'high'],
  ] as const)('RPE %s tiene el tono %s', (rpe, tone) => {
    expect(rpeTone(rpe)).toBe(tone)
  })

  test.each([
    [10, 'Esfuerzo máximo'],
    [9, 'Una repetición en reserva'],
    [8, 'Dos repeticiones en reserva'],
    [7, 'Tres repeticiones en reserva'],
    [6, 'Moderado'],
    [5, 'Moderado'],
    [4, 'Liviano'],
    [1, 'Liviano'],
  ])('RPE %s: "%s"', (rpe, description) => {
    expect(rpeDescription(rpe)).toBe(description)
  })
})
