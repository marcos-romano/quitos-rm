// Archivo de programa: un programa completo en JSON, para cargarlo desde el iPhone
// con "Importar programa". Los ejercicios van por nombre: al importar se buscan en
// el catálogo y los que no están se agregan. Cada serie va por separado, nunca "N x M".
//
// {
//   "format": "quitos-rm-program", "version": 1,
//   "program": { "name": "Plan de fuerza", "weeks": [ { "number": 1, "days": [ { "name": "Día 1",
//     "prep": "...", "blocks": [ { "name": "Fuerza 1", "type": "strength", "restSec": 180,
//       "exercises": [ { "exercise": "Dominadas", "note": "...",
//         "sets": [ { "reps": 8, "percent": 65 }, { "seconds": 30 }, { "meters": 15, "kg": 24 } ] } ] } ] } ] } ] }
// }

import { cleanName, normalizeName } from './names.ts'
import type {
  Block,
  BlockExercise,
  BlockType,
  Day,
  Exercise,
  Load,
  Measure,
  MeasureKind,
  PrescribedSet,
  Program,
  Week,
} from './types.ts'

export const PROGRAM_FILE_FORMAT = 'quitos-rm-program'
export const PROGRAM_FILE_VERSION = 1

const BLOCK_TYPES: readonly BlockType[] = ['power', 'strength', 'hypertrophy', 'structure', 'extra', 'other']

/** En el archivo, la medida va como "reps", "seconds" o "meters". */
const MEASURE_KEYS: Record<string, MeasureKind> = { reps: 'reps', seconds: 'time', meters: 'distance' }

// ─── Contenido del archivo, ya revisado ──────────────────────────────────────

export interface FileSet {
  measure: Measure
  load: Load
  restSec?: number
}

export interface FileExercise {
  exercise: string
  note?: string
  sets: FileSet[]
}

export interface FileBlock {
  name: string
  type: BlockType
  restSec: number
  exercises: FileExercise[]
}

export interface FileDay {
  name: string
  prep?: string
  blocks: FileBlock[]
}

export interface FileWeek {
  number: number
  label?: string
  days: FileDay[]
}

export interface FileProgram {
  name: string
  description?: string
  weeks: FileWeek[]
}

export type ParseResult = { ok: true; program: FileProgram } | { ok: false; errors: string[] }

// ─── Lectura y revisión ──────────────────────────────────────────────────────

/**
 * Lee el texto del archivo y revisa todo antes de guardar nada. Si hay errores,
 * los devuelve todos juntos, cada uno con su ubicación.
 */
export function parseProgramFile(text: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, errors: ['El archivo no es un programa de quitos_RM: no se pudo leer.'] }
  }
  if (!isObject(data) || data.format !== PROGRAM_FILE_FORMAT) {
    return { ok: false, errors: ['El archivo no es un programa de quitos_RM.'] }
  }
  if (data.version !== PROGRAM_FILE_VERSION) {
    return { ok: false, errors: [`El archivo es de una versión que esta app no conoce (${String(data.version)}).`] }
  }
  const errors: string[] = []
  const program = readProgram(data.program, errors)
  return errors.length === 0 && program ? { ok: true, program } : { ok: false, errors }
}

function readProgram(value: unknown, errors: string[]): FileProgram | undefined {
  if (!isObject(value)) {
    errors.push('Falta el programa.')
    return undefined
  }
  const name = readText(value.name, 'Programa: falta el nombre.', errors)
  const weeks = readList(value.weeks, 'Programa: no tiene semanas.', errors).map((week, i) =>
    readWeek(week, `Semana ${i + 1}`, errors),
  )
  return { name, description: optionalText(value.description), weeks }
}

function readWeek(value: unknown, where: string, errors: string[]): FileWeek {
  const week = isObject(value) ? value : {}
  const number = readNumber(week.number, `${where}: el número tiene que ser un entero mayor que cero.`, errors, {
    integer: true,
  })
  const at = number > 0 ? `Semana ${number}` : where
  const days = readList(week.days, `${at}: no tiene días.`, errors).map((day, i) =>
    readDay(day, `${at} · Día ${i + 1}`, errors),
  )
  return { number, label: optionalText(week.label), days }
}

function readDay(value: unknown, where: string, errors: string[]): FileDay {
  const day = isObject(value) ? value : {}
  const name = readText(day.name, `${where}: falta el nombre.`, errors)
  const at = name ? where.replace(/Día \d+$/, name) : where
  const blocks = readList(day.blocks, `${at}: no tiene bloques.`, errors).map((block, i) =>
    readBlock(block, `${at} · bloque ${i + 1}`, errors),
  )
  return { name, prep: optionalText(day.prep), blocks }
}

function readBlock(value: unknown, where: string, errors: string[]): FileBlock {
  const block = isObject(value) ? value : {}
  const name = readText(block.name, `${where}: falta el nombre.`, errors)
  const at = name ? where.replace(/bloque \d+$/, name) : where
  const type = BLOCK_TYPES.find((t) => t === block.type)
  if (!type) errors.push(`${at}: el tipo "${String(block.type)}" no existe.`)
  const restSec = readNumber(block.restSec, `${at}: el descanso tiene que ser un número de segundos.`, errors, {
    integer: true,
    allowZero: true,
  })
  const exercises = readList(block.exercises, `${at}: no tiene ejercicios.`, errors).map((exercise, i) =>
    readExercise(exercise, `${at} · ejercicio ${i + 1}`, errors),
  )
  return { name, type: type ?? 'other', restSec, exercises }
}

function readExercise(value: unknown, where: string, errors: string[]): FileExercise {
  const exercise = isObject(value) ? value : {}
  const name = readText(exercise.exercise, `${where}: falta el nombre del ejercicio.`, errors)
  const at = name ? where.replace(/ejercicio \d+$/, name) : where
  const sets = readList(exercise.sets, `${at}: no tiene series.`, errors).map((set, i) =>
    readSet(set, `${at} · serie ${i + 1}`, errors),
  )
  return { exercise: name, note: optionalText(exercise.note), sets }
}

function readSet(value: unknown, where: string, errors: string[]): FileSet {
  const set = isObject(value) ? value : {}

  const measureKeys = Object.keys(MEASURE_KEYS).filter((key) => set[key] !== undefined)
  let measure: Measure = { kind: 'reps', value: 0 }
  if (measureKeys.length !== 1) {
    errors.push(`${where}: tiene que tener una sola medida (repeticiones, segundos o metros).`)
  } else {
    const key = measureKeys[0]
    const value = readNumber(set[key], `${where}: la medida tiene que ser un número mayor que cero.`, errors, {
      integer: key === 'reps',
    })
    measure = { kind: MEASURE_KEYS[key], value }
  }

  let load: Load = { kind: 'free' }
  if (set.percent !== undefined && set.kg !== undefined) {
    errors.push(`${where}: la carga es un porcentaje o kg, no las dos cosas.`)
  } else if (set.percent !== undefined) {
    load = { kind: 'percent', percent: readNumber(set.percent, `${where}: el porcentaje tiene que ser un número.`, errors) }
  } else if (set.kg !== undefined) {
    load = { kind: 'kg', kg: readNumber(set.kg, `${where}: los kg tienen que ser un número.`, errors) }
  }

  const restSec =
    set.restSec === undefined
      ? undefined
      : readNumber(set.restSec, `${where}: el descanso tiene que ser un número de segundos.`, errors, {
          integer: true,
          allowZero: true,
        })
  return restSec === undefined ? { measure, load } : { measure, load, restSec }
}

// ─── Ayudas de lectura ───────────────────────────────────────────────────────

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readText(value: unknown, error: string, errors: string[]): string {
  const text = typeof value === 'string' ? cleanName(value) : ''
  if (text === '') errors.push(error)
  return text
}

function optionalText(value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : ''
  return text === '' ? undefined : text
}

function readList(value: unknown, error: string, errors: string[]): unknown[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(error)
    return []
  }
  return value
}

/** Un número de verdad: un texto como "65%" o "diez" no pasa. */
function readNumber(
  value: unknown,
  error: string,
  errors: string[],
  { integer = false, allowZero = false } = {},
): number {
  const valid =
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (allowZero ? value >= 0 : value > 0) &&
    (!integer || Number.isInteger(value))
  if (!valid) errors.push(error)
  return valid ? value : 0
}

// ─── Del archivo al programa ─────────────────────────────────────────────────

export interface ImportPlan {
  program: Program
  /** Ejercicios que no estaban en el catálogo y se agregan al importar. */
  newExercises: Exercise[]
}

/**
 * Arma el programa a partir del archivo, con ids nuevos. Cada nombre de ejercicio
 * se busca en el catálogo sin importar mayúsculas, tildes ni espacios; los que no
 * están se crean con la medida de su primera serie.
 */
export function buildProgram(file: FileProgram, catalog: readonly Exercise[], now: Date = new Date()): ImportPlan {
  const byKey = new Map(catalog.map((exercise) => [exercise.nameKey, exercise]))
  const newExercises: Exercise[] = []

  function exerciseFor(entry: FileExercise): Exercise {
    const nameKey = normalizeName(entry.exercise)
    let exercise = byKey.get(nameKey)
    if (!exercise) {
      exercise = { id: newId(), name: cleanName(entry.exercise), nameKey, measure: entry.sets[0].measure.kind }
      byKey.set(nameKey, exercise)
      newExercises.push(exercise)
    }
    return exercise
  }

  const at = now.toISOString()
  const program: Program = {
    id: newId(),
    name: file.name,
    ...(file.description && { description: file.description }),
    createdAt: at,
    updatedAt: at,
    weeks: file.weeks.map(
      (week): Week => ({
        id: newId(),
        number: week.number,
        ...(week.label && { label: week.label }),
        days: week.days.map(
          (day): Day => ({
            id: newId(),
            name: day.name,
            ...(day.prep && { prep: day.prep }),
            blocks: day.blocks.map(
              (block): Block => ({
                id: newId(),
                name: block.name,
                type: block.type,
                restSec: block.restSec,
                exercises: block.exercises.map(
                  (entry): BlockExercise => ({
                    id: newId(),
                    exerciseId: exerciseFor(entry).id,
                    ...(entry.note && { note: entry.note }),
                    sets: entry.sets.map((set): PrescribedSet => ({ id: newId(), ...set })),
                  }),
                ),
              }),
            ),
          }),
        ),
      }),
    ),
  }
  return { program, newExercises }
}

/** Resumen para la pantalla de revisión, antes de guardar. */
export function summarizeProgram(program: Program) {
  const days = program.weeks.flatMap((week) => week.days)
  const exercises = days.flatMap((day) => day.blocks.flatMap((block) => block.exercises))
  return {
    weeks: program.weeks.length,
    days: days.length,
    exercises: new Set(exercises.map((exercise) => exercise.exerciseId)).size,
    sets: exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
  }
}

function newId(): string {
  return crypto.randomUUID()
}
