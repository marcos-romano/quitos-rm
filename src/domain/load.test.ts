import { describe, expect, test } from 'vitest'
import { coachDay1Week1, coachExercises } from './coachDay1Week1.fixture.ts'
import {
  DEFAULT_GLOBAL_ROUNDING,
  percentOfMax,
  prescribedLoad,
  PULL_UP_ROUNDING,
  resolveIncrement,
} from './load.ts'

// Tabla obligatoria de CLAUDE.md §5: máximo, porcentaje, exacto, redondeo 1,25 y redondeo 2,5.
const REQUIRED_CASES: [number, number, number, number, number][] = [
  [120, 70, 84, 83.75, 85],
  [120, 65, 78, 77.5, 77.5],
  [100, 85, 85, 85, 85],
  [97, 85, 82.45, 82.5, 82.5],
  [105, 90, 94.5, 95, 95],
  [35, 65, 22.75, 22.5, 22.5],
  [35, 70, 24.5, 25, 25],
  [35, 75, 26.25, 26.25, 27.5],
  [35, 80, 28, 27.5, 27.5],
  [35, 85, 29.75, 30, 30],
  [35, 90, 31.5, 31.25, 32.5],
]

describe('tabla obligatoria de CLAUDE.md §5', () => {
  test.each(REQUIRED_CASES)('%s kg al %s%%: exacto %s', (max, percent, exact) => {
    expect(percentOfMax(max, percent, 'exact')).toEqual({ kg: exact, exactKg: exact })
  })

  test.each(REQUIRED_CASES)('%s kg al %s%%: redondeo 1,25 kg da %s', (max, percent, exact, by125) => {
    expect(percentOfMax(max, percent, 1.25)).toEqual({ kg: by125, exactKg: exact })
  })

  test.each(REQUIRED_CASES)('%s kg al %s%%: redondeo 2,5 kg da %s', (max, percent, exact, _by125, by25) => {
    expect(percentOfMax(max, percent, 2.5)).toEqual({ kg: by25, exactKg: exact })
  })
})

describe('redondeo', () => {
  test('el empate va hacia arriba: 35 kg al 75% son 10,5 incrementos de 2,5 → 27,5', () => {
    expect(percentOfMax(35, 75, 2.5).kg).toBe(27.5)
  })

  test.each([
    [97, 85, 0.5, 82.5],
    [97, 85, 1, 82],
    [97, 85, 5, 80],
    [35, 75, 0.5, 26.5], // empate: 52,5 incrementos
    [105, 90, 1, 95], // empate: 94,5
    [50, 75, 5, 40], // empate: 7,5 incrementos
  ] as const)('%s kg al %s%% con incremento de %s kg da %s', (max, percent, increment, expected) => {
    expect(percentOfMax(max, percent, increment).kg).toBe(expected)
  })

  test('evita el error de coma flotante: 87,5 kg al 70% es 61,25 y con redondeo de 2,5 kg da 62,5', () => {
    // La cuenta directa da 61.24999999999999: el empate se perdería y redondearía a 60.
    const naive = 87.5 * (70 / 100)
    expect(naive).not.toBe(61.25)
    expect(Math.round(naive / 2.5) * 2.5).toBe(60)
    expect(percentOfMax(87.5, 70, 2.5)).toEqual({ kg: 62.5, exactKg: 61.25 })
  })

  test('máximo y porcentaje con decimales: 102,5 kg al 72,5%', () => {
    expect(percentOfMax(102.5, 72.5, 'exact').exactKg).toBe(74.31)
    expect(percentOfMax(102.5, 72.5, 1.25).kg).toBe(73.75)
    expect(percentOfMax(102.5, 72.5, 2.5).kg).toBe(75)
  })
})

describe('prescribedLoad', () => {
  test('carga libre: no calcula nada', () => {
    expect(prescribedLoad({ kind: 'free' }, 100, 2.5)).toEqual({ status: 'free' })
  })

  test('kg fijos: se muestran tal cual, sin redondear', () => {
    expect(prescribedLoad({ kind: 'kg', kg: 61.3 }, undefined, 2.5)).toEqual({ status: 'fixed', kg: 61.3 })
  })

  test('porcentaje sin máximo cargado: avisa en lugar de inventar un peso', () => {
    expect(prescribedLoad({ kind: 'percent', percent: 70 }, undefined, 2.5)).toEqual({
      status: 'missing-max',
    })
  })

  test('porcentaje con máximo: calcula el peso redondeado y el exacto', () => {
    expect(prescribedLoad({ kind: 'percent', percent: 70 }, 120, 2.5)).toEqual({
      status: 'calculated',
      kg: 85,
      exactKg: 84,
    })
  })
})

describe('resolveIncrement', () => {
  test('sin incremento propio se usa el global, que por defecto es 2,5 kg', () => {
    expect(resolveIncrement({}, DEFAULT_GLOBAL_ROUNDING)).toBe(2.5)
  })

  test('el incremento propio del ejercicio reemplaza al global', () => {
    expect(resolveIncrement({ roundingIncrement: PULL_UP_ROUNDING }, 2.5)).toBe(1.25)
  })

  test('el incremento propio "exacto" también reemplaza al global', () => {
    expect(resolveIncrement({ roundingIncrement: 'exact' }, 2.5)).toBe('exact')
  })
})

describe('caso real: Día 1 · Semana 1 del programa del entrenador', () => {
  const maxes: Record<string, number> = { dominadas: 35, sentadilla: 120 }

  function loadsOf(blockExerciseId: string): (number | string)[] {
    const blockExercise = coachDay1Week1.blocks
      .flatMap((block) => block.exercises)
      .find((e) => e.id === blockExerciseId)!
    const exercise = coachExercises.find((e) => e.id === blockExercise.exerciseId)!
    const increment = resolveIncrement(exercise, DEFAULT_GLOBAL_ROUNDING)
    return blockExercise.sets.map((set) => {
      const result = prescribedLoad(set.load, maxes[exercise.id], increment)
      return result.status === 'calculated' ? result.kg : result.status
    })
  }

  test('tiene cuatro bloques con su descanso por ronda', () => {
    expect(coachDay1Week1.blocks.map((b) => [b.name, b.restSec])).toEqual([
      ['Potencia', 120],
      ['Fuerza 1', 180],
      ['Fuerza 2', 180],
      ['Estructura', 90],
    ])
  })

  test('dominadas con máximo de 35 kg y redondeo propio de 1,25 kg', () => {
    expect(loadsOf('fuerza-1-dominadas')).toEqual([22.5, 22.5, 25, 25])
  })

  test('sentadilla con máximo de 120 kg y redondeo global de 2,5 kg', () => {
    expect(loadsOf('fuerza-2-sentadilla')).toEqual([77.5, 77.5, 85, 85])
  })

  test('el arranque no tiene carga prescripta', () => {
    expect(loadsOf('potencia-arranque')).toEqual(['free', 'free', 'free', 'free'])
  })

  test('representa series en repeticiones, en segundos y en metros', () => {
    const exercises = coachDay1Week1.blocks.flatMap((block) => block.exercises)
    const firstSet = (id: string) => exercises.find((e) => e.id === id)!.sets[0]
    // "6/6" en el PDF: se carga el número de un lado.
    expect(firstSet('fuerza-1-press-landmine').measure).toEqual({ kind: 'reps', value: 6 })
    expect(firstSet('fuerza-2-isquio-isometrico').measure).toEqual({ kind: 'time', value: 30 })
    expect(firstSet('estructura-caminata-granjero').measure).toEqual({ kind: 'distance', value: 15 })
  })
})
