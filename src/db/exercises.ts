// Catálogo de ejercicios.

import { cleanName, normalizeName } from '../domain/names.ts'
import type { Exercise, MeasureKind, RoundingIncrement } from '../domain/types.ts'
import type { QuitosDb } from './db.ts'

/** Todos los ejercicios, en orden alfabético. */
export async function listExercises(db: QuitosDb): Promise<Exercise[]> {
  const exercises = await db.exercises.toArray()
  return exercises.sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

/** Busca sin importar mayúsculas, tildes ni espacios sobrantes. */
export async function findExerciseByName(db: QuitosDb, name: string): Promise<Exercise | undefined> {
  return db.exercises.where('nameKey').equals(normalizeName(name)).first()
}

export async function createExercise(
  db: QuitosDb,
  input: { name: string; measure?: MeasureKind; roundingIncrement?: RoundingIncrement },
): Promise<Exercise> {
  const name = cleanName(input.name)
  if (name === '') throw new Error('El ejercicio necesita un nombre.')

  const existing = await findExerciseByName(db, name)
  if (existing) throw new Error(`Ya existe un ejercicio llamado "${existing.name}".`)

  const exercise: Exercise = {
    id: crypto.randomUUID(),
    name,
    nameKey: normalizeName(name),
    measure: input.measure ?? 'reps',
    ...(input.roundingIncrement !== undefined && { roundingIncrement: input.roundingIncrement }),
  }
  await db.exercises.add(exercise)
  return exercise
}
