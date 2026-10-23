// Cálculo de la carga prescripta (CLAUDE.md §5).
//
// Las cuentas se hacen con números enteros para evitar errores de coma flotante
// (en una computadora, 87,5 × 0,70 da 61,24999999999999 y no 61,25):
// los kg se pasan a centésimas y los porcentajes a décimas.

import type { Load, RoundingIncrement } from './types.ts'

export const ROUNDING_INCREMENTS: readonly RoundingIncrement[] = ['exact', 0.5, 1, 1.25, 2.5, 5]

/** Valor global por defecto: el incremento mínimo con barra (discos de 1,25 kg por lado). */
export const DEFAULT_GLOBAL_ROUNDING: RoundingIncrement = 2.5

/** Incremento propio inicial para dominadas: la carga se agrega con discos sueltos. */
export const PULL_UP_ROUNDING: RoundingIncrement = 1.25

export type LoadResult =
  | { status: 'free' }
  | { status: 'missing-max' }
  | { status: 'fixed'; kg: number }
  | { status: 'calculated'; kg: number; exactKg: number }

/** El incremento propio del ejercicio, si lo tiene; si no, el global. */
export function resolveIncrement(
  exercise: { roundingIncrement?: RoundingIncrement },
  globalIncrement: RoundingIncrement,
): RoundingIncrement {
  return exercise.roundingIncrement ?? globalIncrement
}

/**
 * Carga de una serie. Sin máximo cargado no se calcula nada: no se inventan valores.
 * `maxKg` es el máximo actual del ejercicio, o `undefined` si no tiene.
 */
export function prescribedLoad(
  load: Load,
  maxKg: number | undefined,
  increment: RoundingIncrement,
): LoadResult {
  switch (load.kind) {
    case 'free':
      return { status: 'free' }
    case 'kg':
      return { status: 'fixed', kg: load.kg }
    case 'percent':
      if (maxKg === undefined) return { status: 'missing-max' }
      return { status: 'calculated', ...percentOfMax(maxKg, load.percent, increment) }
  }
}

/**
 * Peso = máximo × porcentaje / 100, redondeado al incremento más cercano
 * (los empates van hacia arriba). `exactKg` es el valor sin redondear, a la centésima.
 */
export function percentOfMax(
  maxKg: number,
  percent: number,
  increment: RoundingIncrement,
): { kg: number; exactKg: number } {
  // Máximo en centésimas de kg × porcentaje en décimas = peso en centésimas × 1000.
  const product = Math.round(maxKg * 100) * Math.round(percent * 10)
  const exactHundredths = divideRoundingHalfUp(product, 1000)
  const exactKg = exactHundredths / 100

  if (increment === 'exact') return { kg: exactKg, exactKg }

  const incrementHundredths = Math.round(increment * 100)
  const steps = divideRoundingHalfUp(product, 1000 * incrementHundredths)
  return { kg: (steps * incrementHundredths) / 100, exactKg }
}

/** Divide dos enteros positivos y redondea al entero más cercano; los empates van hacia arriba. */
function divideRoundingHalfUp(dividend: number, divisor: number): number {
  const numerator = 2 * dividend + divisor
  const denominator = 2 * divisor
  return (numerator - (numerator % denominator)) / denominator
}
