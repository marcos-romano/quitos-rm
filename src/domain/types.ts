// Modelo de datos de quitos_RM (CLAUDE.md §4).
// Se separa lo prescripto (el plan) de lo realizado (el registro).

export type Id = string

/** Fecha del día local, sin hora: "2026-10-23". */
export type LocalDate = string

/** Momento exacto, en formato ISO: "2026-10-23T14:05:00.000Z". */
export type Timestamp = string

// ─── Plan ────────────────────────────────────────────────────────────────────
// Un programa se guarda como una sola ficha completa:
// programa → semanas → días → bloques → ejercicios → series.
// El orden de cada lista es la posición de sus elementos.

export type BlockType = 'power' | 'strength' | 'hypertrophy' | 'structure' | 'extra' | 'other'

/** Qué se cuenta en una serie: repeticiones, segundos o metros. */
export type MeasureKind = 'reps' | 'time' | 'distance'

export interface Measure {
  kind: MeasureKind
  value: number
}

/** Carga de una serie: porcentaje del máximo, kg fijos o libre (sin carga prescripta). */
export type Load =
  | { kind: 'percent'; percent: number }
  | { kind: 'kg'; kg: number }
  | { kind: 'free' }

/** Su posición en la lista de series equivale al número de ronda. */
export interface PrescribedSet {
  id: Id
  measure: Measure
  perSide: boolean
  load: Load
  /** Descanso propio en segundos; reemplaza al del bloque. */
  restSec?: number
  note?: string
}

export interface BlockExercise {
  id: Id
  exerciseId: Id
  /** Indicación del plan, de solo lectura durante la sesión. */
  note?: string
  sets: PrescribedSet[]
}

/** Se entrena como superserie: el descanso se aplica al cerrar cada ronda. */
export interface Block {
  id: Id
  name: string
  type: BlockType
  restSec: number
  exercises: BlockExercise[]
}

export interface Day {
  id: Id
  name: string
  /** Preparación previa, por ejemplo "5' foam roll, 5' movilidad, 5' flexibilidad". */
  prep?: string
  blocks: Block[]
}

export interface Week {
  id: Id
  number: number
  label?: string
  days: Day[]
}

export interface Program {
  id: Id
  name: string
  description?: string
  weeks: Week[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Catálogo y máximos ──────────────────────────────────────────────────────
// Van aparte del programa porque los comparten todos los programas.

/** Incremento de redondeo de cargas, en kg. */
export type RoundingIncrement = 'exact' | 0.5 | 1 | 1.25 | 2.5 | 5

export interface Exercise {
  id: Id
  name: string
  /** Nombre normalizado (sin tildes ni mayúsculas) para no duplicar ejercicios. */
  nameKey: string
  measure: MeasureKind
  /** Incremento propio; si falta, se usa el global de Ajustes. */
  roundingIncrement?: RoundingIncrement
}

/** Cada máximo nuevo se agrega: el historial nunca se pisa. */
export interface Max {
  id: Id
  exerciseId: Id
  kg: number
  date: LocalDate
  createdAt: Timestamp
}

// ─── Registro ────────────────────────────────────────────────────────────────
// Provisorio: se ajusta en el paso 5, al construir la sesión por rondas.

export type SessionStatus = 'in_progress' | 'completed' | 'skipped'

export interface PerformedSet {
  done: boolean
  /** Repeticiones, segundos o metros realizados. */
  value?: number
  kg?: number
  /** Kg prescriptos al tildar la serie: un máximo nuevo no altera el historial. */
  prescribedKg?: number
  doneAt?: Timestamp
}

/** RPE de 1 a 10 y nota, ambos opcionales e independientes. */
export interface ExerciseEffort {
  rpe?: number
  note?: string
}

export interface Session {
  id: Id
  programId: Id
  weekId: Id
  dayId: Id
  status: SessionStatus
  date: LocalDate
  /** Copia de la prescripción del día al iniciar: editar el plan no altera la sesión. */
  day: Day
  /** Por id de serie prescripta. */
  sets: Record<Id, PerformedSet>
  /** Por id de ejercicio del bloque. */
  efforts: Record<Id, ExerciseEffort>
  note?: string
  startedAt: Timestamp
  finishedAt?: Timestamp
}
