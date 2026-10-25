// Reglas para armar y editar el plan (CLAUDE.md §6.2), sin pantallas ni base de datos.
// Cada función recibe un programa y devuelve uno nuevo: el original nunca se modifica.
// El orden de cada lista es la posición de sus elementos.

import { cleanName } from './names.ts'
import type {
  Block,
  BlockExercise,
  Day,
  Id,
  MeasureKind,
  PrescribedSet,
  Program,
  Week,
} from './types.ts'

// ─── Rutas ───────────────────────────────────────────────────────────────────
// Dónde está un elemento: los ids desde la semana hacia abajo.

export interface WeekPath {
  weekId: Id
}
export interface DayPath extends WeekPath {
  dayId: Id
}
export interface BlockPath extends DayPath {
  blockId: Id
}
/** `blockExerciseId` es el ejercicio dentro del bloque, no el del catálogo. */
export interface ExercisePath extends BlockPath {
  blockExerciseId: Id
}
export interface SetPath extends ExercisePath {
  setId: Id
}
export type PlanPath = WeekPath | DayPath | BlockPath | ExercisePath | SetPath

// ─── Programas ───────────────────────────────────────────────────────────────

export type ProgramFields = Pick<Program, 'name' | 'description'>

export function createProgram(name: string, now: Date = new Date()): Program {
  const at = now.toISOString()
  return { id: newId(), name: cleanName(name), weeks: [], createdAt: at, updatedAt: at }
}

export function updateProgram(program: Program, changes: Partial<ProgramFields>): Program {
  return { ...program, ...cleanNames(changes) }
}

/** Copia completa con ids nuevos, para armar variaciones de un programa existente. */
export function duplicateProgram(program: Program, now: Date = new Date()): Program {
  const at = now.toISOString()
  return {
    ...program,
    id: newId(),
    name: copyName(program.name),
    weeks: program.weeks.map(cloneWeek),
    createdAt: at,
    updatedAt: at,
  }
}

// ─── Semanas ─────────────────────────────────────────────────────────────────
// El número lo pone el usuario y la app nunca lo cambia sola: mover, borrar o
// duplicar una semana no renumera las demás.

export type WeekFields = Pick<Week, 'number' | 'label'>

/** El número que se propone para una semana nueva: uno más que el mayor. */
export function nextWeekNumber(program: Program): number {
  return Math.max(0, ...program.weeks.map((week) => week.number)) + 1
}

export function addWeek(program: Program, fields: Partial<WeekFields> = {}): Program {
  const week: Week = { id: newId(), days: [], ...fields, number: fields.number ?? nextWeekNumber(program) }
  return { ...program, weeks: [...program.weeks, week] }
}

export function updateWeek(program: Program, path: WeekPath, changes: Partial<WeekFields>): Program {
  return withWeeks(program, (weeks) => patchById(weeks, path.weekId, changes))
}

// ─── Días ────────────────────────────────────────────────────────────────────

export type DayFields = Pick<Day, 'name' | 'prep'>

/** Un día nuevo va al final; si no se indica nombre, se llama "Día N" según su posición. */
export function addDay(program: Program, path: WeekPath, fields: Partial<DayFields> = {}): Program {
  return withDays(program, path, (days) => [
    ...days,
    { id: newId(), blocks: [], ...fields, name: cleanName(fields.name ?? `Día ${days.length + 1}`) },
  ])
}

export function updateDay(program: Program, path: DayPath, changes: Partial<DayFields>): Program {
  return withDays(program, path, (days) => patchById(days, path.dayId, cleanNames(changes)))
}

// ─── Bloques ─────────────────────────────────────────────────────────────────

export type BlockFields = Pick<Block, 'name' | 'type' | 'restSec'>

export function addBlock(program: Program, path: DayPath, fields: BlockFields): Program {
  return withBlocks(program, path, (blocks) => [
    ...blocks,
    { id: newId(), exercises: [], ...cleanNames(fields) },
  ])
}

export function updateBlock(program: Program, path: BlockPath, changes: Partial<BlockFields>): Program {
  return withBlocks(program, path, (blocks) => patchById(blocks, path.blockId, cleanNames(changes)))
}

// ─── Ejercicios del bloque ───────────────────────────────────────────────────

export type ExerciseFields = Pick<BlockExercise, 'exerciseId' | 'note'>

/** Agrega un ejercicio del catálogo al final del bloque, todavía sin series. */
export function addExercise(program: Program, path: BlockPath, exerciseId: Id): Program {
  return withExercises(program, path, (exercises) => [
    ...exercises,
    { id: newId(), exerciseId, sets: [] },
  ])
}

export function updateExercise(
  program: Program,
  path: ExercisePath,
  changes: Partial<ExerciseFields>,
): Program {
  return withExercises(program, path, (exercises) => patchById(exercises, path.blockExerciseId, changes))
}

// ─── Series ──────────────────────────────────────────────────────────────────
// Siempre de a una: nunca "N x M".

export type SetFields = Omit<PrescribedSet, 'id'>

/** Valores de la primera serie de un ejercicio, para editar enseguida. */
export const FIRST_SET_VALUE: Record<MeasureKind, number> = { reps: 10, time: 30, distance: 15 }

/**
 * Agrega una serie al final, como copia de la anterior. Si es la primera, arranca
 * con la medida del ejercicio, el valor de `FIRST_SET_VALUE` y carga libre.
 */
export function addSet(program: Program, path: ExercisePath, measureKind: MeasureKind): Program {
  return withSets(program, path, (sets) => {
    const previous = sets.at(-1)
    const set: PrescribedSet = previous
      ? { ...previous, id: newId() }
      : {
          id: newId(),
          measure: { kind: measureKind, value: FIRST_SET_VALUE[measureKind] },
          load: { kind: 'free' },
        }
    return [...sets, set]
  })
}

export function updateSet(program: Program, path: SetPath, changes: Partial<SetFields>): Program {
  return withSets(program, path, (sets) => patchById(sets, path.setId, changes))
}

// ─── En cualquier nivel: mover, eliminar y duplicar ──────────────────────────
// El nivel se deduce de la ruta: el id más profundo indica el elemento.

/** Sube (-1) o baja (+1) un lugar el elemento. En los extremos no hace nada. */
export function moveItem(program: Program, path: PlanPath, offset: -1 | 1): Program {
  return changeList(program, path, (list, id) => {
    const from = indexById(list, id)
    const to = from + offset
    if (to < 0 || to >= list.length) return list
    const moved = [...list]
    ;[moved[from], moved[to]] = [moved[to], moved[from]]
    return moved
  })
}

/** Elimina el elemento con todo lo que contiene. La pantalla pide confirmación antes. */
export function removeItem(program: Program, path: PlanPath): Program {
  return changeList(program, path, (list, id) => {
    const index = indexById(list, id)
    return list.filter((_, i) => i !== index)
  })
}

/**
 * Duplica el elemento con todo lo que contiene, con ids nuevos.
 * - Semana: la copia va al final, con el número siguiente al mayor.
 * - Día y bloque: la copia va justo después, con "(copia)" en el nombre.
 * - Ejercicio y serie: la copia va justo después.
 */
export function duplicateItem(program: Program, path: PlanPath): Program {
  if ('setId' in path) {
    return withSets(program, path, (sets) => insertCopyAfter(sets, path.setId, cloneSet))
  }
  if ('blockExerciseId' in path) {
    return withExercises(program, path, (exercises) =>
      insertCopyAfter(exercises, path.blockExerciseId, cloneExercise),
    )
  }
  if ('blockId' in path) {
    return withBlocks(program, path, (blocks) =>
      insertCopyAfter(blocks, path.blockId, (block) => ({ ...cloneBlock(block), name: copyName(block.name) })),
    )
  }
  if ('dayId' in path) {
    return withDays(program, path, (days) =>
      insertCopyAfter(days, path.dayId, (day) => ({ ...cloneDay(day), name: copyName(day.name) })),
    )
  }
  const week = program.weeks[indexById(program.weeks, path.weekId)]
  const copy: Week = { ...cloneWeek(week), number: nextWeekNumber(program) }
  return { ...program, weeks: [...program.weeks, copy] }
}

// ─── Recorrido del programa ──────────────────────────────────────────────────
// Cada función cambia una lista dentro del programa y copia solo el camino hasta
// ella; lo demás se comparte sin tocar.

type Identified = { id: Id }

function withWeeks(program: Program, change: (weeks: Week[]) => Week[]): Program {
  return { ...program, weeks: change(program.weeks) }
}

function withDays(program: Program, path: WeekPath, change: (days: Day[]) => Day[]): Program {
  return withWeeks(program, (weeks) =>
    mapById(weeks, path.weekId, (week) => ({ ...week, days: change(week.days) })),
  )
}

function withBlocks(program: Program, path: DayPath, change: (blocks: Block[]) => Block[]): Program {
  return withDays(program, path, (days) =>
    mapById(days, path.dayId, (day) => ({ ...day, blocks: change(day.blocks) })),
  )
}

function withExercises(
  program: Program,
  path: BlockPath,
  change: (exercises: BlockExercise[]) => BlockExercise[],
): Program {
  return withBlocks(program, path, (blocks) =>
    mapById(blocks, path.blockId, (block) => ({ ...block, exercises: change(block.exercises) })),
  )
}

function withSets(
  program: Program,
  path: ExercisePath,
  change: (sets: PrescribedSet[]) => PrescribedSet[],
): Program {
  return withExercises(program, path, (exercises) =>
    mapById(exercises, path.blockExerciseId, (exercise) => ({ ...exercise, sets: change(exercise.sets) })),
  )
}

/** Cambia la lista que contiene al elemento de la ruta, sea del nivel que sea. */
function changeList(
  program: Program,
  path: PlanPath,
  change: <T extends Identified>(list: T[], id: Id) => T[],
): Program {
  if ('setId' in path) return withSets(program, path, (sets) => change(sets, path.setId))
  if ('blockExerciseId' in path) {
    return withExercises(program, path, (exercises) => change(exercises, path.blockExerciseId))
  }
  if ('blockId' in path) return withBlocks(program, path, (blocks) => change(blocks, path.blockId))
  if ('dayId' in path) return withDays(program, path, (days) => change(days, path.dayId))
  return withWeeks(program, (weeks) => change(weeks, path.weekId))
}

// ─── Listas ──────────────────────────────────────────────────────────────────

function indexById(list: readonly Identified[], id: Id): number {
  const index = list.findIndex((item) => item.id === id)
  if (index === -1) throw new Error(`No se encontró el elemento ${id} en el programa.`)
  return index
}

function mapById<T extends Identified>(list: T[], id: Id, change: (item: T) => T): T[] {
  const index = indexById(list, id)
  return list.map((item, i) => (i === index ? change(item) : item))
}

function patchById<T extends Identified>(list: T[], id: Id, changes: Partial<NoInfer<T>>): T[] {
  return mapById(list, id, (item) => ({ ...item, ...changes }))
}

function insertCopyAfter<T extends Identified>(list: T[], id: Id, copy: (item: T) => T): T[] {
  const index = indexById(list, id)
  return [...list.slice(0, index + 1), copy(list[index]), ...list.slice(index + 1)]
}

// ─── Copias con ids nuevos ───────────────────────────────────────────────────

function newId(): Id {
  return crypto.randomUUID()
}

function copyName(name: string): string {
  return `${name} (copia)`
}

/** Saca los espacios sobrantes del nombre, si viene entre los cambios. */
function cleanNames<T extends { name?: string }>(changes: T): T {
  return changes.name === undefined ? changes : { ...changes, name: cleanName(changes.name) }
}

function cloneWeek(week: Week): Week {
  return { ...week, id: newId(), days: week.days.map(cloneDay) }
}

function cloneDay(day: Day): Day {
  return { ...day, id: newId(), blocks: day.blocks.map(cloneBlock) }
}

function cloneBlock(block: Block): Block {
  return { ...block, id: newId(), exercises: block.exercises.map(cloneExercise) }
}

function cloneExercise(exercise: BlockExercise): BlockExercise {
  return { ...exercise, id: newId(), sets: exercise.sets.map(cloneSet) }
}

function cloneSet(set: PrescribedSet): PrescribedSet {
  return { ...set, id: newId() }
}
