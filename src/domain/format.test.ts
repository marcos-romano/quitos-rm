import { describe, expect, test } from 'vitest'
import {
  formatCount,
  formatDate,
  formatDayLabel,
  formatIncrement,
  formatKg,
  formatLoad,
  formatNumber,
  formatNumberForInput,
  formatMeasure,
  formatRest,
  formatSetLoad,
  formatSetShort,
  formatWeekTitle,
  parseDecimal,
  parseSeconds,
  parseWholeNumber,
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

describe('números enteros escritos por el usuario', () => {
  test('acepta enteros mayores que cero, con espacios alrededor', () => {
    expect(parseWholeNumber('3')).toBe(3)
    expect(parseWholeNumber(' 12 ')).toBe(12)
  })

  test('rechaza el cero, los decimales, los negativos y las letras', () => {
    for (const text of ['0', '3,5', '3.5', '-2', 'tres', '1O', '']) {
      expect(parseWholeNumber(text)).toBeUndefined()
    }
  })
})

describe('números en campos editables', () => {
  test('sin separador de miles y con coma decimal, y se vuelven a leer igual', () => {
    for (const value of [1200, 87.5, 62.5, 8, 0.5]) {
      const text = formatNumberForInput(value)
      expect(text).not.toContain('.')
      expect(parseDecimal(text)).toBe(value)
    }
    expect(formatNumberForInput(1200)).toBe('1200')
    expect(formatNumberForInput(87.5)).toBe('87,5')
  })
})

describe('segundos de descanso', () => {
  test('acepta enteros, incluido el cero', () => {
    expect(parseSeconds('120')).toBe(120)
    expect(parseSeconds(' 0 ')).toBe(0)
  })

  test('rechaza decimales, letras y vacío', () => {
    for (const text of ['90,5', '2 min', '', '-30']) expect(parseSeconds(text)).toBeUndefined()
  })
})

describe('textos del plan', () => {
  test('cantidades en singular o plural', () => {
    expect(formatCount(1, 'semana', 'semanas')).toBe('1 semana')
    expect(formatCount(4, 'semana', 'semanas')).toBe('4 semanas')
    expect(formatCount(0, 'día', 'días')).toBe('0 días')
    expect(formatCount(1200, 'serie', 'series')).toBe('1.200 series')
  })

  test('título de la semana, con la etiqueta entre paréntesis', () => {
    expect(formatWeekTitle({ number: 1 })).toBe('Semana 1')
    expect(formatWeekTitle({ number: 1, label: 'copia' })).toBe('Semana 1 (copia)')
    expect(formatWeekTitle({ number: 4, label: 'Descarga' })).toBe('Semana 4 (Descarga)')
  })

  test('medida de una serie', () => {
    expect(formatMeasure({ kind: 'reps', value: 8 })).toBe('8 repeticiones')
    expect(formatMeasure({ kind: 'reps', value: 1 })).toBe('1 repetición')
    expect(formatMeasure({ kind: 'time', value: 30 })).toBe('30 s')
    expect(formatMeasure({ kind: 'distance', value: 12.5 })).toBe('12,5 m')
  })

  test('cada serie en pocas palabras, sin resumir en "N x M"', () => {
    expect(formatSetShort({ measure: { kind: 'reps', value: 8 }, load: { kind: 'percent', percent: 65 } })).toBe('8 al 65%')
    expect(formatSetShort({ measure: { kind: 'reps', value: 8 }, load: { kind: 'kg', kg: 20 } })).toBe('8 con 20 kg')
    expect(formatSetShort({ measure: { kind: 'reps', value: 4 }, load: { kind: 'free' } })).toBe('4')
    expect(formatSetShort({ measure: { kind: 'time', value: 30 }, load: { kind: 'free' } })).toBe('30 s')
    expect(formatSetShort({ measure: { kind: 'distance', value: 15 }, load: { kind: 'kg', kg: 24 } })).toBe('15 m con 24 kg')
    expect(formatSetShort({ measure: { kind: 'reps', value: 6 }, load: { kind: 'percent', percent: 62.5 } })).toBe(
      '6 al 62,5%',
    )
  })

  test('carga de una serie con su cálculo', () => {
    const percent = { kind: 'percent', percent: 65 } as const
    expect(formatSetLoad(percent, { status: 'calculated', kg: 22.5, exactKg: 22.75 })).toBe('65% · 22,5 kg')
    expect(formatSetLoad(percent, { status: 'missing-max' })).toBe('65% · Falta cargar el máximo')
    expect(formatSetLoad({ kind: 'kg', kg: 20 }, { status: 'fixed', kg: 20 })).toBe('20 kg')
    expect(formatSetLoad({ kind: 'free' }, { status: 'free' })).toBe('Libre')
  })

  test('descanso en segundos', () => {
    expect(formatRest(180)).toBe('180 s')
    expect(formatRest(90)).toBe('90 s')
  })
})
