import { describe, expect, test } from 'vitest'
import {
  formatDate,
  formatDayLabel,
  formatIncrement,
  formatKg,
  formatLoad,
  formatNumber,
  parseDecimal,
  toLocalDate,
} from './format.ts'

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

describe('parseDecimal', () => {
  test.each([
    ['87,5', 87.5],
    ['87.5', 87.5],
    [' 100 ', 100],
    ['82,45', 82.45],
  ])('"%s" se lee como %s', (text, expected) => {
    expect(parseDecimal(text)).toBe(expected)
  })

  test.each(['', 'abc', '1O', '1,2,3', '-5', '87,'])('"%s" no es un número válido', (text) => {
    expect(parseDecimal(text)).toBeUndefined()
  })
})

describe('formatDayLabel', () => {
  test('el botón del día dice "Semana 3 · Día 2", con punto medio', () => {
    expect(formatDayLabel(3, 'Día 2')).toBe('Semana 3 · Día 2')
  })
})

describe('formatIncrement', () => {
  test.each([
    [1.25, '1,25 kg'],
    [2.5, '2,5 kg'],
    [5, '5 kg'],
    ['exact', 'exacto'],
  ] as const)('%s se muestra como "%s"', (increment, expected) => {
    expect(formatIncrement(increment)).toBe(expected)
  })
})

describe('formatKg', () => {
  test('agrega la unidad: 87,5 kg', () => {
    expect(formatKg(87.5)).toBe('87,5 kg')
  })
})

describe('formatLoad', () => {
  test('peso calculado: principal redondeado y secundario exacto', () => {
    expect(formatLoad({ status: 'calculated', kg: 85, exactKg: 84 })).toEqual({
      main: '85 kg',
      secondary: '84 exactos',
    })
  })

  test('exacto con decimales lleva coma', () => {
    expect(formatLoad({ status: 'calculated', kg: 82.5, exactKg: 82.45 }).secondary).toBe('82,45 exactos')
  })

  test('kg fijos, libre y sin máximo', () => {
    expect(formatLoad({ status: 'fixed', kg: 60 })).toEqual({ main: '60 kg' })
    expect(formatLoad({ status: 'free' })).toEqual({ main: 'Libre' })
    expect(formatLoad({ status: 'missing-max' })).toEqual({ main: 'Falta cargar el máximo' })
  })
})

describe('fechas', () => {
  test('se muestran como dd/mm/aaaa', () => {
    expect(formatDate('2026-10-23')).toBe('23/10/2026')
    expect(formatDate('2026-01-05')).toBe('05/01/2026')
  })

  test('un entrenamiento a las 23:30 queda en su día, no en el siguiente', () => {
    expect(toLocalDate(new Date(2026, 9, 23, 23, 30))).toBe('2026-10-23')
  })

  test('el primer minuto del día también es de ese día', () => {
    expect(toLocalDate(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05')
  })
})
